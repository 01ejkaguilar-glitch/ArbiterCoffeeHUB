<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class ProductCollection extends ResourceCollection
{
    /**
     * Create a new resource instance.
     *
     * @param  mixed  $resource
     * @param  array|null  $additional
     * @return void
     */
    public function __construct($resource, $additional = null)
    {
        parent::__construct($resource);

        if (!is_null($additional)) {
            $this->additional = $additional;
        }
    }

    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $data = [];

        // Transform each item in the collection
        foreach ($this->collection as $resource) {
            $data[] = $resource->toArray($request);
        }

        // Get total from the paginator if available
        $total = $this->count(); // fallback to current page count
        if (isset($this->resource) && method_exists($this->resource, 'total')) {
            $total = $this->resource->total();
        }

        return [
            'data' => $data,
            'meta' => [
                'total' => $total,
            ],
        ];
    }
}