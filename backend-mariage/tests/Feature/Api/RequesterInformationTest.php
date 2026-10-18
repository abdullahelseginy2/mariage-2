<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class RequesterInformationTest extends TestCase
{
    use RefreshDatabase;

    public function test_requester_name_and_order_date_are_generated_for_every_content_type(): void
    {
        Carbon::setTestNow('2026-09-10 12:00:00');

        $cases = [
            ['/api/v1/admin/invitations', ['groom_name' => 'Omar', 'bride_name' => 'Nour'], 'Omar & Nour'],
            ['/api/v1/admin/birthday-greetings', ['recipient_name' => 'Mariam', 'sender_name' => 'Ali'], 'Mariam & Ali'],
            ['/api/v1/admin/eid-greetings', ['recipient_name' => 'Salma', 'sender_name' => 'Ahmed'], 'Salma & Ahmed'],
            ['/api/v1/admin/love-messages', ['recipient_name' => 'Hana', 'sender_name' => 'Youssef'], 'Hana & Youssef'],
        ];

        foreach ($cases as [$endpoint, $payload, $expectedName]) {
            $this->postJson($endpoint, $payload)
                ->assertCreated()
                ->assertJsonPath('data.requester_name', $expectedName)
                ->assertJsonPath('data.requester_whatsapp', null)
                ->assertJsonPath('data.order_date', '2026-09-10');
        }
    }

    public function test_optional_requester_values_are_persisted_and_blank_name_reuses_couple_names(): void
    {
        $response = $this->postJson('/api/v1/admin/invitations', [
            'groom_name' => 'Karim',
            'bride_name' => 'Farah',
            'requester_name' => 'Wedding Agency',
            'requester_whatsapp' => '+20 100-123-4567',
            'order_date' => '2026-08-25',
        ])
            ->assertCreated()
            ->assertJsonPath('data.requester_name', 'Wedding Agency')
            ->assertJsonPath('data.requester_whatsapp', '+20 100-123-4567')
            ->assertJsonPath('data.order_date', '2026-08-25');

        $this->getJson('/api/v1/admin/invitations?search=100-123&date=2026-08-25')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.requester_name', 'Wedding Agency');

        $this->putJson('/api/v1/admin/invitations/'.$response->json('data.id'), [
            'groom_name' => 'Karim Updated',
            'bride_name' => 'Farah Updated',
            'requester_name' => '',
            'requester_whatsapp' => '',
            'order_date' => '2026-08-25',
        ])
            ->assertOk()
            ->assertJsonPath('data.requester_name', 'Karim Updated & Farah Updated')
            ->assertJsonPath('data.requester_whatsapp', null);
    }
}
