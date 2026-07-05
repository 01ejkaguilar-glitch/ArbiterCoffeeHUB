@extends('layouts.admin')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Failed Job Details</h1>
        <div>
            <a href="{{ route('admin.failed-jobs.index') }}" class="btn btn-outline-secondary">
                ← Back to List
            </a>
            <form action="{{ route('admin.failed-jobs.destroy', $failedJob->id) }}" method="POST"
                  onsubmit="return confirm('Delete this failed job permanently? This action cannot be undone.');"
                  class="d-inline">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn btn-danger">Delete</button>
            </form>
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

    <div class="row">
        <div class="col-md-8">
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Job Information</h5>
                </div>
                <div class="card-body">
                    <dl class="row">
                        <dt class="col-sm-3">ID:</dt>
                        <dd class="col-sm-9">{{ $failedJob->id }}</dd>

                        <dt class="col-sm-3">Failed At:</dt>
                        <dd class="col-sm-9">{{ $failedJob->failed_at->format('Y-m-d H:i:s') }}</dd>

                        <dt class="col-sm-3">Connection:</dt>
                        <dd class="col-sm-9">{{ $failedJob->connection }}</dd>

                        <dt class="col-sm-3">Queue:</dt>
                        <dd class="col-sm-9">{{ $failedJob->queue }}</dd>

                        <dt class="col-sm-3">Payload:</dt>
                        <dd class="col-sm-9">
                            <pre class="bg-light p-3 rounded">{{ json_encode(json_decode($failedJob->payload, true), JSON_PRETTY_PRINT) }}</pre>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Exception Details</h5>
                </div>
                <div class="card-body">
                    <div class="alert alert-danger">
                        <h6 class="alert-heading">Exception Message</h6>
                        <p class="mb-1">{{ strlen($failedJob->exception) > 500 ? substr($failedJob->exception, 0, 500) . '...' : $failedJob->exception) }}</p>
                        <hr>
                        <small class="text-muted">
                            <strong>Full Exception:</strong><br>
                            <pre class="mb-0 small">{{ $failedJob->exception }}</pre>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection