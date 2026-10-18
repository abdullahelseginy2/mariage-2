<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = ['invitations', 'eid_greetings', 'birthday_greetings', 'love_messages'];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $blueprint): void {
                $blueprint->string('requester_name', 180)->nullable()->after('slug');
                $blueprint->string('requester_whatsapp', 32)->nullable()->after('requester_name');
                $blueprint->date('order_date')->nullable()->after('requester_whatsapp');
            });
        }

        $this->backfillInvitations();
        foreach (['eid_greetings', 'birthday_greetings', 'love_messages'] as $table) {
            DB::table($table)->orderBy('id')->each(function (object $record) use ($table): void {
                DB::table($table)->where('id', $record->id)->update([
                    'requester_name' => trim("{$record->recipient_name} & {$record->sender_name}"),
                    'order_date' => $record->created_at ? date('Y-m-d', strtotime((string) $record->created_at)) : now()->toDateString(),
                ]);
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $blueprint): void {
                $blueprint->dropColumn(['requester_name', 'requester_whatsapp', 'order_date']);
            });
        }
    }

    private function backfillInvitations(): void
    {
        DB::table('invitations')->orderBy('id')->each(function (object $invitation): void {
            $groom = $this->displayName($invitation->groom_name);
            $bride = $this->displayName($invitation->bride_name);
            DB::table('invitations')->where('id', $invitation->id)->update([
                'requester_name' => trim("{$groom} & {$bride}"),
                'order_date' => $invitation->created_at ? date('Y-m-d', strtotime((string) $invitation->created_at)) : now()->toDateString(),
            ]);
        });
    }

    private function displayName(mixed $value): string
    {
        if (! is_string($value)) return '';
        $decoded = json_decode($value, true);
        return is_array($decoded) ? (string) ($decoded['en'] ?? $decoded['ar'] ?? '') : $value;
    }
};
