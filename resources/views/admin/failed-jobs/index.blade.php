@extends('layouts.admin')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Failed Jobs</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
            <div class="btn-group me-2">
                <a href="{{ route('admin.failed-jobs.retry-all') }}" class="btn btn-sm btn-outline-secondary">
                    Retry All Failed Jobs
                </a>
                <a href="{{ route('admin.failed-jobs.clear-all') }}" class="btn btn-sm btn-outline-danger"
                   onclick="return confirm('Are you sure you want to delete all failed jobs? This action cannot be undone.');">
                    Clear All Failed Jobs
                </a>
            </div>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            {{ session('error') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-md-3">
            <div class="card bg-light">
                <div class="card-body">
                    <h5 class="card-title">Total Failed Jobs</h5>
                    <p class="card-text display-4 text-danger">{{ $stats['total'] }}</p>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-light">
                <div class="card-body">
                    <h5 class="card-title">Failed in Last 24h</h5>
                    <p class="card-text display-4 text-warning">{{ $stats['last_24h'] }}</p>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-light">
                <div class="card-body">
                    <h5 class="card-title">By Connection</h5>
                    <ul class="list-group list-group-flush">
                        @foreach($stats['by_connection'] as $connection => $count)
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                {{ $connection ?? 'default' }}
                                <span class="badge bg-primary rounded-pill">{{ $count }}</span>
                            </li>
                        @endforeach
                    </ul>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-light">
                <div class="card-body">
                    <h5 class="card-title">By Queue</h5>
                    <ul class="list-group list-group-flush">
                        @foreach($stats['by_queue'] as $queue => $count)
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                {{ $queue ?? 'default' }}
                                <span class="badge bg-primary rounded-pill">{{ $count }}</span>
                            </li>
                        @endforeach
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Search and Filter Form -->
    <div class="card mb-4">
        <div class="card-header">
            <h5 class="mb-0">Filter & Search</h5>
        </div>
        <div class="card-body">
            <form method="GET" action="{{ route('admin.failed-jobs.index') }}">
                <div class="row g-3">
                    <div class="col-md-4">
                        <label for="search" class="form-label">Search</label>
                        <input type="text" class="form-control" id="search" name="search" value="{{ $search ?? '' }}" placeholder="Search in exception, payload, connection, queue...">
                    </div>
                    <div class="col-md-2">
                        <label for="connection" class="form-label">Connection</label>
                        <select class="form-select" id="connection" name="connection">
                            <option value="">All Connections</option>
                            @foreach($connections as $connection)
                                <option value="{{ $connection }}" {{ $connectionFilter == $connection ? 'selected' : '' }}>
                                    {{ $connection ?? 'default' }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label for="queue" class="form-label">Queue</label>
                        <select class="form-select" id="queue" name="queue">
                            <option value="">All Queues</option>
                            @foreach($queues as $queue)
                                <option value="{{ $queue }}" {{ $queueFilter == $queue ? 'selected' : '' }}>
                                    {{ $queue ?? 'default' }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label for="sort_by" class="form-label">Sort By</label>
                        <select class="form-select" id="sort_by" name="sort_by">
                            <option value="failed_at" {{ $sortBy == 'failed_at' ? 'selected' : '' }}>Failed At (Newest)</option>
                            <option value="failed_at_desc" {{ $sortBy == 'failed_at_desc' ? 'selected' : '' }}>Failed At (Oldest)</option>
                            <option value="queue" {{ $sortBy == 'queue' ? 'selected' : '' }}>Queue</option>
                            <option value="connection" {{ $sortBy == 'connection' ? 'selected' : '' }}>Connection</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label for="per_page" class="form-label">Entries</label>
                        <select class="form-select" id="per_page" name="per_page">
                            <option value="10" {{ $perPage == 10 ? 'selected' : '' }}>10</option>
                            <option value="25" {{ $perPage == 25 ? 'selected' : '' }}>25</option>
                            <option value="50" {{ $perPage == 50 ? 'selected' : '' }}>50</option>
                            <option value="100" {{ $perPage == 100 ? 'selected' : '' }}>100</option>
                        </select>
                    </div>
                    <div class="col-md-2 d-grid">
                        <button type="submit" class="btn btn-primary">Apply Filters</button>
                        <a href="{{ route('admin.failed-jobs.index') }}" class="btn btn-outline-secondary">Reset</a>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Failed Jobs Table -->
    <div class="card">
        <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Failed Jobs List</h5>
            </div>
        </div>
        <div class="card-body">
            @if($failedJobs->isEmpty())
                <div class="alert alert-info">
                    No failed jobs found matching the current filters.
                </div>
            @else
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Failed At</th>
                                <th>Queue</th>
                                <th>Connection</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($failedJobs as $job)
                                <tr>
                                    <td>{{ $loop->iteration }}</td>
                                    <td>{{ $job->failed_at }}</td>
                                    <td>{{ $job->queue ?? 'default' }}</td>
                                    <td>{{ $job->connection ?? 'default' }}</td>
                                    <td>
                                        <div class="btn-group btn-group-sm" role="group">
                                            <a href="{{ route('admin.failed-jobs.show', $job->id) }}" class="btn btn-outline-primary btn-sm">
                                                View
                                            </a>
                                            <form action="{{ route('admin.failed-jobs.destroy', $job->id) }}" method="POST" style="display: inline;">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-outline-danger btn-sm"
                                                        onclick="return confirm('Are you sure you want to delete this failed job?');">
                                                    Delete
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>

                {{ $failedJobs->links() }}
            @endif
        </div>
    </div>
</div>
@endsection