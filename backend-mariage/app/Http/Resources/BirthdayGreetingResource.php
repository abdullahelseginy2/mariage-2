<?php

namespace App\Http\Resources;

use App\Support\MediaUrlNormalizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BirthdayGreetingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdminRoute = $request->routeIs('api.v1.admin.*');

        return [
            'id' => $this->id,
            'code' => $this->code,
            'slug' => $this->slug,
            'public_path' => $this->public_path,
            'recipient_name' => $this->recipient_name,
            'sender_name' => $this->sender_name,
            'requester_name' => $this->requester_name,
            'requester_whatsapp' => $this->requester_whatsapp,
            'order_date' => $this->order_date?->format('Y-m-d'),
            'is_published' => $this->is_published,
            'is_demo' => (bool) ($this->is_demo ?? false),
            'locale' => $this->locale ?? 'en',
            'font_family' => $this->font_family ?? 'elegant',
            'template' => $this->template ?? 'default',
            'content' => MediaUrlNormalizer::normalize($this->content ?? [], $request, ! $isAdminRoute),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
