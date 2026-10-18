<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class EidGreeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'slug',
        'requester_name',
        'requester_whatsapp',
        'order_date',
        'recipient_name',
        'sender_name',
        'is_published',
        'locale',
        'font_family',
        'content',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'order_date' => 'date',
            'content' => 'array',
        ];
    }

    public function getPublicPathAttribute(): string
    {
        return "{$this->slug}-{$this->code}";
    }

    public static function makeSlug(string $recipientName, string $senderName): string
    {
        return Str::slug($recipientName.'-'.$senderName) ?: 'eid-greeting';
    }
}
