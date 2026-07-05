<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class BackupDatabaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:database
                            {--destination= : Backup destination disk (local, s3, etc.)}
                            {--compress : Compress the backup file}
                            {--temp-dir= : Temporary directory for backup}
                            {--only-files : Backup only files (skip database)}
                            {--notify : Send notification on completion}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backup the database and/or files to a specified destination';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $onlyFiles = $this->option('only-files');
        $notify = $this->option('notify');

        try {
            if ($onlyFiles) {
                $result = $this->backupFiles();
            } else {
                $result = $this->backupDatabase();
            }

            // Send notification if requested
            if ($notify) {
                $this->sendNotification($result === 0, $onlyFiles ? 'file' : 'database');
            }

            return $result;
        } catch (\Exception $e) {
            $this->error("Backup failed: " . $e->getMessage());
            Log::error('Backup failed: ' . $e->getMessage(), ['exception' => $e]);

            // Send failure notification
            if ($notify) {
                $this->sendNotification(false, $onlyFiles ? 'file' : 'database', $e->getMessage());
            }

            return 1;
        }
    }

    /**
     * Backup the database.
     */
    protected function backupDatabase()
    {
        $this->info('Starting database backup...');

        // Get database configuration
        $database = config('database.connections.' . config('database.default'));

        if (!$database) {
            $this->error('Database configuration not found.');
            return 1;
        }

        // Set up temporary directory
        $tempDir = $this->option('temp-dir') ?: sys_get_temp_dir() . '/laravel-backup-' . time();
        if (!File::isDirectory($tempDir)) {
            File::makeDirectory($tempDir, 0755, true);
        }

        // Generate backup filename
        $date = now()->format('Y-m-d_His');
        $filename = "database-backup-{$date}.sql";
        $filePath = "{$tempDir}/{$filename}";

        try {
            // Perform database dump using mysqldump
            $this->performMysqldump($database, $filePath);

            // Compress if requested
            if ($this->option('compress')) {
                $this->info('Compressing backup...');
                $filePath .= '.gz';
                $this->compressFile(str_replace('.gz', '', $filePath), $filePath);
                // Remove uncompressed file
                File::delete(str_replace('.gz', '', $filePath));
            }

            // Move to permanent storage
            $destinationDisk = $this->option('destination') ?: config('backup.destination', 'local');
            $backupPath = "backups/database/{$filename}" . ($this->option('compress') ? '.gz' : '');

            $this->info("Moving backup to {$destinationDisk}:{$backupPath}...");
            Storage::disk($destinationDisk)->put(
                $backupPath,
                File::get($filePath)
            );

            // Clean up temporary file
            File::delete($filePath);

            $size = Storage::disk($destinationDisk)->size($backupPath);
            $this->info("Database backup completed successfully! Size: " . $this->formatBytes($size));

            // Log success
            Log::info('Database backup completed', [
                'destination' => $destinationDisk,
                'path' => $backupPath,
                'size' => $size,
                'compressed' => $this->option('compress')
            ]);

            return 0;
        } catch (\Exception $e) {
            $this->error("Backup failed: " . $e->getMessage());
            // Clean up on failure
            if (File::exists($filePath)) {
                File::delete($filePath);
            }
            return 1;
        }
    }

    /**
     * Backup files (storage, config, etc.)
     */
    protected function backupFiles()
    {
        $this->info('Starting file backup...');

        // Set up temporary directory
        $tempDir = $this->option('temp-dir') ?: sys_get_temp_dir() . '/laravel-backup-files-' . time();
        if (!File::isDirectory($tempDir)) {
            File::makeDirectory($tempDir, 0755, true);
        }

        // Generate backup filename
        $date = now()->format('Y-m-d_His');
        $filename = "files-backup-{$date}.tar";
        $filePath = "{$tempDir}/{$filename}";

        try {
            // Create tar archive of important directories
            $this->createFileBackup($tempDir, $filePath);

            // Compress if requested
            if ($this->option('compress')) {
                $this->info('Compressing backup...');
                $filePath .= '.gz';
                $this->compressFile(str_replace('.gz', '', $filePath), $filePath);
                // Remove uncompressed file
                File::delete(str_replace('.gz', '', $filePath));
            }

            // Move to permanent storage
            $destinationDisk = $this->option('destination') ?: config('backup.destination', 'local');
            $backupPath = "backups/files/{$filename}" . ($this->option('compress') ? '.gz' : '');

            $this->info("Moving backup to {$destinationDisk}:{$backupPath}...");
            Storage::disk($destinationDisk)->put(
                $backupPath,
                File::get($filePath)
            );

            // Clean up temporary file
            File::delete($filePath);

            $size = Storage::disk($destinationDisk)->size($backupPath);
            $this->info("File backup completed successfully! Size: " . $this->formatBytes($size));

            // Log success
            Log::info('File backup completed', [
                'destination' => $destinationDisk,
                'path' => $backupPath,
                'size' => $size,
                'compressed' => $this->option('compress')
            ]);

            return 0;
        } catch (\Exception $e) {
            $this->error("File backup failed: " . $e->getMessage());
            // Clean up on failure
            if (File::exists($filePath)) {
                File::delete($filePath);
            }
            return 1;
        }
    }

    /**
     * Perform mysqldump to create database backup.
     */
    protected function performMysqldump(array $database, string $outputFile): void
    {
        $this->info('Creating database dump...');

        $host = $database['host'] ?? '127.0.0.1';
        $port = $database['port'] ?? 3306;
        $databaseName = $database['database'];
        $username = $database['username'];
        $password = $database['password'];

        // Build mysqldump command
        $command = sprintf(
            'mysqldump --host=%s --port=%d --user=%s %s %s',
            escapeshellarg($host),
            $port,
            escapeshellarg($username),
            $password ? sprintf('--password=%s', escapeshellarg($password)) : '',
            escapeshellarg($databaseName)
        );

        // Add additional options for better backups
        $command .= ' --single-transaction --routines --triggers';

        // Redirect output to file
        $command .= " > " . escapeshellarg($outputFile);

        $process = new Process($command);
        $process->setTimeout(300); // 5 minutes timeout

        $process->run(function ($type, $buffer) {
            if (Process::ERR === $type) {
                $this->error($buffer);
            } else {
                $this->output->write($buffer);
            }
        });

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $this->info('Database dump created successfully.');
    }

    /**
     * Create a tar backup of important files.
     */
    protected function createFileBackup(string $tempDir, string $outputFile): void
    {
        $this->info('Creating file archive...');

        // Define directories to backup
        $directories = [
            base_path('storage/app'), // User uploads
            base_path('storage/logs'), // Logs
            base_path('config'), // Configuration files
            base_path('resources/views'), // Views
            base_path('routes'), // Routes
        ];

        // Filter to only existing directories
        $existingDirectories = array_filter($directories, 'is_dir');

        if (empty($existingDirectories)) {
            throw new \Exception('No directories found to backup');
        }

        // Build tar command
        $directoriesString = implode(' ', array_map('escapeshellarg', $existingDirectories));
        $command = sprintf(
            'tar -cf %s %s',
            escapeshellarg($outputFile),
            $directoriesString
        );

        $process = new Process($command);
        $process->setTimeout(120); // 2 minutes timeout

        $process->run(function ($type, $buffer) {
            if (Process::ERR === $type) {
                $this->error($buffer);
            } else {
                $this->output->write($buffer);
            }
        });

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $this->info('File archive created successfully.');
    }

    /**
     * Compress a file using gzip.
     */
    protected function compressFile(string $source, string $destination): void
    {
        $this->info('Compressing file...');

        $command = sprintf(
            'gzip -c %s > %s',
            escapeshellarg($source),
            escapeshellarg($destination)
        );

        $process = new Process($command);
        $process->setTimeout(60); // 1 minute timeout

        $process->run(function ($type, $buffer) {
            if (Process::ERR === $type) {
                $this->error($buffer);
            } else {
                $this->output->write($buffer);
            }
        });

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $this->info('File compressed successfully.');
    }

    /**
     * Send notification about backup completion/failure.
     */
    protected function sendNotification(bool $success, string $type, string $errorMessage = null): void
    {
        $status = $success ? 'SUCCESS' : 'FAILED';
        $message = "Backup {$type}: {$status}";

        if ($errorMessage) {
            $message .= " - {$errorMessage}";
        }

        // Log the notification
        if ($success) {
            $this->info($message);
            Log::info($message);
        } else {
            $this->error($message);
            Log::error($message);
        }

        // TODO: Implement actual notification channels (email, Slack, webhook)
        // For now, just log - in production this would integrate with notification services
    }

    /**
     * Format bytes to human readable format.
     */
    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= (1024 ** $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}