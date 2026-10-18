<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InvitationEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_and_public_can_read_invitation(): void
    {
        $response = $this->postJson('/api/v1/admin/invitations', [
            'groom_name' => 'Abdullah',
            'bride_name' => 'Walaa',
            'hero' => ['kicker' => 'We are getting married'],
            'event' => ['venue' => 'Cleopatra Hall'],
            'template' => 'signature',
            'font_sizes' => [
                'groom_name.en' => 48,
                'hero.en.kicker' => 22,
            ],
        ])
            ->assertCreated()
            ->assertJsonPath('data.groom_name', 'Abdullah')
            ->assertJsonPath('data.bride_name', 'Walaa')
            ->assertJsonPath('data.template', 'signature')
            ->assertJsonPath('data.font_sizes', [
                'groom_name.en' => 48,
                'hero.en.kicker' => 22,
            ]);

        $publicPath = $response->json('data.public_path');

        $this->getJson("/api/v1/invitations/{$publicPath}")
            ->assertOk()
            ->assertJsonPath('data.public_path', $publicPath)
            ->assertJsonPath('data.hero.kicker', 'We are getting married');
    }


    public function test_admin_can_create_invitation_with_custom_public_path(): void
    {
        $this->postJson('/api/v1/admin/invitations', [
            'groom_name' => 'Abdullah',
            'bride_name' => 'Walaa',
            'public_path' => 'abdullah-and-walaa-4321',
        ])
            ->assertCreated()
            ->assertJsonPath('data.public_path', 'abdullah-and-walaa-4321');
    }

    public function test_guest_upload_section_settings_are_preserved_when_saving(): void
    {
        $response = $this->postJson('/api/v1/admin/invitations', [
            'groom_name' => ['en' => 'Abdullah', 'ar' => 'عبدالله'],
            'bride_name' => ['en' => 'Walaa', 'ar' => 'ولاء'],
            'party_upload' => [
                'is_enabled' => true,
                'max_images' => 8,
                'en' => ['title' => 'Share your photos'],
                'ar' => ['title' => 'شارك صورك'],
            ],
        ])
            ->assertCreated()
            ->assertJsonPath('data.party_upload.is_enabled', true)
            ->assertJsonPath('data.party_upload.max_images', 8)
            ->assertJsonPath('data.party_upload.en.title', 'Share your photos')
            ->assertJsonPath('data.party_upload.ar.title', 'شارك صورك');

        $invitationId = $response->json('data.id');

        $this->putJson("/api/v1/admin/invitations/{$invitationId}", [
            'groom_name' => ['en' => 'Abdullah', 'ar' => 'عبدالله'],
            'bride_name' => ['en' => 'Walaa', 'ar' => 'ولاء'],
            'party_upload' => [
                'is_enabled' => true,
                'max_images' => 12,
                'en' => ['title' => 'Upload wedding photos'],
                'ar' => ['title' => 'ارفع صور الزفاف'],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.party_upload.is_enabled', true)
            ->assertJsonPath('data.party_upload.max_images', 12)
            ->assertJsonPath('data.party_upload.en.title', 'Upload wedding photos')
            ->assertJsonPath('data.party_upload.ar.title', 'ارفع صور الزفاف');
    }

    public function test_admin_can_create_royal_invitation_template(): void
    {
        $this->postJson('/api/v1/admin/invitations', [
            'groom_name' => 'Abdullah',
            'bride_name' => 'Walaa',
            'template' => 'royal',
        ])
            ->assertCreated()
            ->assertJsonPath('data.template', 'royal');
    }

    public function test_admin_can_create_love_letter_invitation_template(): void
    {
        $this->postJson('/api/v1/admin/invitations', [
            'groom_name' => 'Abdullah',
            'bride_name' => 'Walaa',
            'template' => 'love-letter',
        ])
            ->assertCreated()
            ->assertJsonPath('data.template', 'love-letter');
    }

    public function test_admin_can_create_floral_butterfly_invitation_template(): void
    {
        $this->postJson('/api/v1/admin/invitations', [
            'groom_name' => 'Abdullah',
            'bride_name' => 'Walaa',
            'template' => 'floral-butterfly',
        ])
            ->assertCreated()
            ->assertJsonPath('data.template', 'floral-butterfly');
    }

    public function test_admin_can_create_modern_minimal_invitation_template(): void
    {
        $this->postJson('/api/v1/admin/invitations', [
            'groom_name' => 'Abdullah',
            'bride_name' => 'Walaa',
            'template' => 'modern-minimal',
        ])
            ->assertCreated()
            ->assertJsonPath('data.template', 'modern-minimal');
    }

    public function test_admin_can_create_burgundy_invitation_template(): void
    {
        $this->postJson('/api/v1/admin/invitations', [
            'groom_name' => 'Omar',
            'bride_name' => 'Nour',
            'template' => 'burgundy',
        ])
            ->assertCreated()
            ->assertJsonPath('data.template', 'burgundy');
    }

    public function test_custom_public_path_must_end_with_four_digits(): void
    {
        $this->postJson('/api/v1/admin/invitations', [
            'groom_name' => 'Abdullah',
            'bride_name' => 'Walaa',
            'public_path' => 'abdullah-walaa',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('public_path');
    }

    public function test_invitation_public_path_must_be_globally_unique(): void
    {
        \App\Models\EidGreeting::query()->create([
            'code' => '4321',
            'slug' => 'shared-route',
            'recipient_name' => 'Noor',
            'sender_name' => 'Mawada',
        ]);

        $this->postJson('/api/v1/admin/invitations', [
            'groom_name' => 'Abdullah',
            'bride_name' => 'Walaa',
            'public_path' => 'shared-route-4321',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('public_path')
            ->assertJsonPath('errors.public_path.0', 'This route exists before. Choose another route.');
    }

    public function test_unpublished_invitation_returns_public_message(): void
    {
        $invitation = \App\Models\Invitation::query()->create([
            'code' => '6789',
            'slug' => 'draft-couple',
            'groom_name' => 'Draft',
            'bride_name' => 'Couple',
            'couple_display_name' => 'Draft & Couple',
            'is_published' => false,
        ]);

        $this->getJson("/api/v1/invitations/{$invitation->public_path}")
            ->assertForbidden()
            ->assertJsonPath('message', 'This invitation site is not published yet.');
    }

    public function test_public_invitation_requires_valid_path(): void
    {
        $this->getJson('/api/v1/invitations/not-valid')
            ->assertNotFound();
    }

    public function test_public_invitation_response_removes_missing_storage_images(): void
    {
        Storage::fake('public');

        $response = $this->postJson('/api/v1/admin/invitations', [
            'groom_name' => 'Abdullah',
            'bride_name' => 'Walaa',
            'gallery' => [
                'image_urls' => [
                    'https://old-backend.example/storage/invitations/gallery/missing.jpg',
                ],
            ],
        ])->assertCreated();

        $publicPath = $response->json('data.public_path');

        $this->getJson("/api/v1/invitations/{$publicPath}")
            ->assertOk()
            ->assertJsonPath('data.gallery.image_urls', []);
    }
}
