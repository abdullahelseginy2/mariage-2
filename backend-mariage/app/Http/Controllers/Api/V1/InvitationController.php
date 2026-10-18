<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SaveInvitationRequest;
use App\Http\Resources\InvitationResource;
use App\Models\GuestPhoto;
use App\Models\Invitation;
use App\Models\UploadSetting;
use App\Support\PersistentMediaStorage;
use App\Support\PublicRouteUniqueness;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InvitationController extends Controller
{
    public function __construct(private readonly PublicRouteUniqueness $publicRoutes)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $columns = Schema::getColumnListing('invitations');
        $select = array_values(array_intersect($columns, [
            'id',
            'code',
            'slug',
            'requester_name',
            'requester_whatsapp',
            'order_date',
            'groom_name',
            'bride_name',
            'couple_display_name',
            'is_published',
            'template',
            'locale',
            'font_family',
            'organizer_username',
            'organizer_password',
            'created_at',
            'updated_at',
        ]));

        $orderColumn = in_array('created_at', $columns, true) ? 'created_at' : 'id';
        
        $query = DB::table('invitations');

        if ($request->filled('search')) {
            $search = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('groom_name', 'like', $search)
                  ->orWhere('bride_name', 'like', $search)
                  ->orWhere('couple_display_name', 'like', $search)
                  ->orWhere('requester_name', 'like', $search)
                  ->orWhere('requester_whatsapp', 'like', $search)
                  ->orWhere('slug', 'like', $search)
                  ->orWhere('code', 'like', $search);
            });
        }

        if ($request->filled('template')) {
            $query->where('template', $request->input('template'));
        }

        if ($request->filled('is_demo')) {
            $isDemo = $request->boolean('is_demo');
            if ($isDemo) {
                $query->where(function ($q) {
                    $q->where('is_demo', true)
                      ->orWhere('slug', 'like', 'demo%');
                });
            } else {
                $query->where('is_demo', false)
                      ->where('slug', 'not like', 'demo%');
            }
        }

        if ($request->filled('date')) {
            $query->whereDate('order_date', $request->input('date'));
        }

        $sort = $request->input('sort', 'latest');
        if ($sort === 'oldest') {
            $query->orderBy($orderColumn, 'asc');
        } else {
            $query->orderByDesc($orderColumn);
        }

        $paginator = $query->select('id')->paginate(20);

        $ids = $paginator->getCollection()->pluck('id')->all();
        $rows = empty($ids)
            ? collect()
            : DB::table('invitations')
                ->select($select)
                ->whereIn('id', $ids)
                ->get()
                ->keyBy('id');

        $rsvpCounts = collect();
        if (! empty($ids) && Schema::hasTable('rsvps') && Schema::hasColumn('rsvps', 'invitation_id')) {
            $rsvpCounts = DB::table('rsvps')
                ->select('invitation_id', DB::raw('count(*) as total'))
                ->whereIn('invitation_id', $ids)
                ->groupBy('invitation_id')
                ->pluck('total', 'invitation_id');
        }

        $paginator->setCollection(
            collect($ids)
                ->map(function ($id) use ($rows, $rsvpCounts) {
                    $row = (array) $rows->get($id, []);
                    $row['rsvps_count'] = (int) ($rsvpCounts[$id] ?? 0);

                    return $this->invitationListItem($row);
                })
        );

        return response()->json([
            'data' => $paginator->items(),
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'path' => $paginator->path(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    private function invitationListItem(array $invitation): array
    {
        $slug = $invitation['slug'] ?? '';
        $code = $invitation['code'] ?? '';

        return [
            'id' => $invitation['id'] ?? null,
            'code' => $code,
            'slug' => $slug,
            'public_path' => $slug !== '' && $code !== '' ? "{$slug}-{$code}" : '',
            'groom_name' => $this->decodeMaybeJson($invitation['groom_name'] ?? ''),
            'bride_name' => $this->decodeMaybeJson($invitation['bride_name'] ?? ''),
            'couple_display_name' => $this->decodeMaybeJson($invitation['couple_display_name'] ?? ''),
            'requester_name' => $invitation['requester_name'] ?? null,
            'requester_whatsapp' => $invitation['requester_whatsapp'] ?? null,
            'order_date' => $invitation['order_date'] ?? null,
            'is_published' => (bool) ($invitation['is_published'] ?? false),
            'template' => $invitation['template'] ?? 'classic',
            'locale' => $invitation['locale'] ?? 'en',
            'font_family' => $invitation['font_family'] ?? 'elegant',
            'rsvps_count' => (int) ($invitation['rsvps_count'] ?? 0),
            'organizer_username' => $invitation['organizer_username'] ?? null,
            'organizer_password' => $invitation['organizer_password'] ?? null,
            'created_at' => isset($invitation['created_at']) ? (string) $invitation['created_at'] : null,
            'updated_at' => isset($invitation['updated_at']) ? (string) $invitation['updated_at'] : null,
        ];
    }

    private function decodeMaybeJson(mixed $value, mixed $fallback = null): mixed
    {
        if (! is_string($value)) {
            return $value ?? $fallback;
        }

        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }

    public function store(SaveInvitationRequest $request): JsonResponse
    {
        $invitation = Invitation::create($this->payload($request));

        return (new InvitationResource($invitation->loadCount('rsvps')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Invitation $invitation): InvitationResource
    {
        if (Schema::hasTable('rsvps') && Schema::hasColumn('rsvps', 'invitation_id')) {
            $invitation->loadCount('rsvps');
        }

        return new InvitationResource($invitation);
    }

    public function update(SaveInvitationRequest $request, Invitation $invitation): InvitationResource
    {
        $invitation->update($this->payload($request, $invitation));

        return new InvitationResource($invitation->refresh()->loadCount('rsvps'));
    }

    public function destroy(Invitation $invitation): JsonResponse
    {
        $invitation->delete();

        return response()->json(status: 204);
    }

    public function publicShow(string $publicPath): InvitationResource
    {
        [$slug, $code] = $this->splitPublicPath($publicPath);

        $invitation = Invitation::query()
            ->where('slug', $slug)
            ->where('code', $code)
            ->first();

        if (! $invitation) {
            abort(404, 'Invitation link is invalid or no longer available.');
        }

        if (! $invitation->is_published) {
            abort(403, 'This invitation site is not published yet.');
        }

        return new InvitationResource($invitation);
    }

    public function organizerShow(Request $request, string $publicPath): JsonResponse
    {
        [$slug, $code] = $this->splitPublicPath($publicPath);

        $invitation = Invitation::query()
            ->where('slug', $slug)
            ->where('code', $code)
            ->first();

        if (! $invitation) {
            abort(404, 'Invitation link is invalid or no longer available.');
        }

        $username = $request->header('X-Organizer-Username');
        $password = $request->header('X-Organizer-Password');

        $isAdmin = false;

        // 1. Check if it's a global admin
        if (!empty($username) && !empty($password)) {
            $admin = \Illuminate\Support\Facades\DB::table('admins')
                ->where('username', $username)
                ->first();
                
            if ($admin && \Illuminate\Support\Facades\Hash::check($password, $admin->password)) {
                $isAdmin = true;
            }
        }

        // 2. If not admin, check organizer credentials
        if (!$isAdmin) {
            if (empty($invitation->organizer_username) || empty($invitation->organizer_password) ||
                $username !== $invitation->organizer_username || $password !== $invitation->organizer_password) {
                return response()->json(['message' => 'Invalid or missing organizer credentials.'], 401);
            }
        }

        return response()->json([
            'data' => [
                'invitation' => new InvitationResource($invitation),
                'rsvps' => $invitation->rsvps()->latest()->get(),
                'guest_photos' => $invitation->guestPhotos()->latest()->get(),
                'is_admin' => $isAdmin,
            ]
        ]);
    }

    public function storeGuestPhoto(Request $request, string $publicPath): JsonResponse
    {
        [$slug, $code] = $this->splitPublicPath($publicPath);

        $invitation = Invitation::query()
            ->where('slug', $slug)
            ->where('code', $code)
            ->first();

        if (! $invitation) {
            abort(404, 'Invitation link is invalid or no longer available.');
        }

        $settings = UploadSetting::values();
        $partyUpload = is_array($invitation->party_upload) ? $invitation->party_upload : [];
        $maxImages = (int) ($partyUpload['max_images'] ?? $settings['guest_max_images']);
        $maxImageKb = (int) $settings['guest_image_max_kb'];

        $validated = $request->validate([
            'file' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:'.$maxImageKb],
            'guest_name' => ['nullable', 'string', 'max:120'],
            'uploader_id' => ['nullable', 'string', 'min:16', 'max:100'],
        ], [
            'file.max' => "Each guest photo must be {$maxImageKb} KB or smaller after compression.",
        ]);

        $uploaderId = $validated['uploader_id'] ?? implode('|', [
            (string) $request->ip(),
            (string) $request->userAgent(),
        ]);
        $uploaderKey = hash('sha256', $uploaderId);

        PersistentMediaStorage::ensureReady();
        $guestPhoto = DB::transaction(function () use ($invitation, $request, $validated, $uploaderKey, $maxImages): GuestPhoto {
            Invitation::query()->whereKey($invitation->id)->lockForUpdate()->first();

            $uploadedCount = GuestPhoto::query()
                ->where('invitation_id', $invitation->id)
                ->where('uploader_key', $uploaderKey)
                ->count();

            if ($uploadedCount >= $maxImages) {
                throw ValidationException::withMessages([
                    'file' => ["You have reached the limit of {$maxImages} photos for this invitation."],
                ]);
            }

            $path = $request->file('file')->store(
                'invitations/guest_photos',
                PersistentMediaStorage::diskName()
            );

            return GuestPhoto::create([
                'invitation_id' => $invitation->id,
                'image_url' => PersistentMediaStorage::url($path),
                'guest_name' => $validated['guest_name'] ?? null,
                'uploader_key' => $uploaderKey,
            ]);
        });

        $uploadedCount = GuestPhoto::query()
            ->where('invitation_id', $invitation->id)
            ->where('uploader_key', $uploaderKey)
            ->count();

        return response()->json([
            'data' => $guestPhoto,
            'meta' => [
                'uploaded_count' => $uploadedCount,
                'max_images' => $maxImages,
                'remaining_images' => max(0, $maxImages - $uploadedCount),
                'max_image_size_kb' => $maxImageKb,
            ],
        ], 201);
    }

    public function guestUploadStatus(Request $request, string $publicPath): JsonResponse
    {
        [$slug, $code] = $this->splitPublicPath($publicPath);
        $invitation = Invitation::query()->where('slug', $slug)->where('code', $code)->firstOrFail();
        $validated = $request->validate([
            'uploader_id' => ['required', 'string', 'min:16', 'max:100'],
        ]);
        $settings = UploadSetting::values();
        $partyUpload = is_array($invitation->party_upload) ? $invitation->party_upload : [];
        $maxImages = (int) ($partyUpload['max_images'] ?? $settings['guest_max_images']);
        $uploadedCount = $invitation->guestPhotos()
            ->where('uploader_key', hash('sha256', $validated['uploader_id']))
            ->count();

        return response()->json([
            'data' => [
                'uploaded_count' => $uploadedCount,
                'max_images' => $maxImages,
                'remaining_images' => max(0, $maxImages - $uploadedCount),
                'max_image_size_kb' => (int) $settings['guest_image_max_kb'],
            ],
        ]);
    }

    private function payload(SaveInvitationRequest $request, ?Invitation $invitation = null): array
    {
        $validated = $request->validated();
        $groomNames = $this->normalizeLocalizedName($validated['groom_name']);
        $brideNames = $this->normalizeLocalizedName($validated['bride_name']);
        $groomName = $groomNames['en'] ?: $groomNames['ar'];
        $brideName = $brideNames['en'] ?: $brideNames['ar'];
        [$slug, $code] = $this->routeParts($validated, $invitation, $groomName, $brideName);

        if ($this->publicRoutes->exists($slug, $code, $invitation)) {
            throw ValidationException::withMessages([
                'public_path' => ['This route exists before. Choose another route.'],
            ]);
        }

        return [
            ...Arr::only($validated, [
                'hero',
                'loading',
                'event',
                'love_story',
                'gallery',
                'countdown',
                'rsvp',
                'footer',
                'audio',
                'party_upload',
                'font_sizes',
                'organizer_username',
                'organizer_password',
            ]),
            'groom_name' => $this->encodeLocalizedName($groomNames),
            'bride_name' => $this->encodeLocalizedName($brideNames),
            'couple_display_name' => $this->normalizeDisplayName($validated['couple_display_name'] ?? null, "{$groomName} & {$brideName}"),
            'requester_name' => array_key_exists('requester_name', $validated)
                ? (filled($validated['requester_name'])
                    ? trim((string) $validated['requester_name'])
                    : "{$groomName} & {$brideName}")
                : ($invitation?->requester_name ?: "{$groomName} & {$brideName}"),
            'requester_whatsapp' => array_key_exists('requester_whatsapp', $validated)
                ? (filled($validated['requester_whatsapp']) ? trim((string) $validated['requester_whatsapp']) : null)
                : $invitation?->requester_whatsapp,
            'order_date' => $validated['order_date'] ?? $invitation?->order_date ?? now()->toDateString(),
            'is_published' => $validated['is_published'] ?? true,
            'template' => $validated['template'] ?? $invitation?->template ?? 'classic',
            'locale' => $validated['locale'] ?? $invitation?->locale ?? 'en',
            'font_family' => $validated['font_family'] ?? $invitation?->font_family ?? 'elegant',
            'slug' => $slug,
            'code' => $code,
        ];
    }

    private function routeParts(array $validated, ?Invitation $invitation, string $groomName, string $brideName): array
    {
        if (! empty($validated['public_path'])) {
            return $this->splitPublicPath($validated['public_path']);
        }

        $slug = Invitation::makeSlug($groomName, $brideName);

        return [$slug, $invitation?->code ?? $this->generateCode($slug)];
    }

    private function splitPublicPath(string $publicPath): array
    {
        if (! preg_match('/^(.*)-(\d{4})$/', $publicPath, $matches)) {
            abort(404);
        }

        return [$matches[1], $matches[2]];
    }

    private function normalizeLocalizedName(mixed $name): array
    {
        if (is_array($name)) {
            $english = trim((string) ($name['en'] ?? ''));
            $arabic = trim((string) ($name['ar'] ?? ''));

            return [
                'en' => $english !== '' ? $english : $arabic,
                'ar' => $arabic !== '' ? $arabic : $english,
            ];
        }

        $name = trim((string) $name);

        return ['en' => $name, 'ar' => $name];
    }

    private function encodeLocalizedName(array $name): string
    {
        if (($name['en'] ?? '') === ($name['ar'] ?? '')) {
            return $name['en'] ?? '';
        }

        return json_encode($name, JSON_UNESCAPED_UNICODE);
    }

    private function normalizeDisplayName(mixed $displayName, string $fallback): string
    {
        if (is_array($displayName)) {
            $english = trim((string) ($displayName['en'] ?? ''));
            $arabic = trim((string) ($displayName['ar'] ?? ''));

            return json_encode([
                'en' => $english !== '' ? $english : $fallback,
                'ar' => $arabic !== '' ? $arabic : ($english !== '' ? $english : $fallback),
            ], JSON_UNESCAPED_UNICODE);
        }

        $displayName = trim((string) $displayName);

        return $displayName !== '' ? $displayName : $fallback;
    }

    private function generateCode(string $slug): string
    {
        do {
            $code = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        } while ($this->publicRoutes->exists($slug, $code));

        return $code;
    }

    private function verifyAdmin(Request $request): bool
    {
        $username = $request->header('X-Organizer-Username');
        $password = $request->header('X-Organizer-Password');

        if (empty($username) || empty($password)) {
            return false;
        }

        $admin = \Illuminate\Support\Facades\DB::table('admins')
            ->where('username', $username)
            ->first();

        return $admin && \Illuminate\Support\Facades\Hash::check($password, $admin->password);
    }

    public function deleteRsvp(Request $request, string $publicPath, int $id): JsonResponse
    {
        if (! $this->verifyAdmin($request)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        [$slug, $code] = $this->splitPublicPath($publicPath);
        $invitation = Invitation::where('slug', $slug)->where('code', $code)->first();
        if (!$invitation) {
            abort(404);
        }

        $rsvp = $invitation->rsvps()->find($id);
        if ($rsvp) {
            $rsvp->delete();
        }

        return response()->json(['message' => 'RSVP deleted successfully.']);
    }

    public function deleteAllRsvps(Request $request, string $publicPath): JsonResponse
    {
        if (! $this->verifyAdmin($request)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        [$slug, $code] = $this->splitPublicPath($publicPath);
        $invitation = Invitation::where('slug', $slug)->where('code', $code)->first();
        if (!$invitation) {
            abort(404);
        }

        $invitation->rsvps()->delete();

        return response()->json(['message' => 'All RSVPs deleted successfully.']);
    }

    public function deleteGuestPhoto(Request $request, string $publicPath, int $id): JsonResponse
    {
        if (! $this->verifyAdmin($request)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        [$slug, $code] = $this->splitPublicPath($publicPath);
        $invitation = Invitation::where('slug', $slug)->where('code', $code)->first();
        if (!$invitation) {
            abort(404);
        }

        $photo = $invitation->guestPhotos()->find($id);
        if ($photo) {
            $photo->delete();
        }

        return response()->json(['message' => 'Guest photo deleted successfully.']);
    }

    public function deleteAllGuestPhotos(Request $request, string $publicPath): JsonResponse
    {
        if (! $this->verifyAdmin($request)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        [$slug, $code] = $this->splitPublicPath($publicPath);
        $invitation = Invitation::where('slug', $slug)->where('code', $code)->first();
        if (!$invitation) {
            abort(404);
        }

        $invitation->guestPhotos()->delete();

        return response()->json(['message' => 'All guest photos deleted successfully.']);
    }

    public function downloadGuestPhoto(Request $request, string $publicPath, int $id): StreamedResponse
    {
        [$slug, $code] = $this->splitPublicPath($publicPath);
        $invitation = Invitation::query()->where('slug', $slug)->where('code', $code)->firstOrFail();

        abort_unless($this->canAccessOrganizer($request, $invitation), 401, 'Invalid or missing organizer credentials.');

        $photo = $invitation->guestPhotos()->findOrFail($id);
        $storagePath = $this->guestPhotoStoragePath($photo);
        $disk = Storage::disk(PersistentMediaStorage::diskName());

        abort_unless($storagePath && $disk->exists($storagePath), 404, 'Photo file not found.');

        $extension = strtolower(pathinfo($storagePath, PATHINFO_EXTENSION));
        if (! in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
            $extension = 'jpg';
        }
        $guestName = Str::slug((string) ($photo->guest_name ?: 'guest')) ?: 'guest';
        $filename = "photo_{$photo->id}_{$guestName}.{$extension}";

        return $disk->download($storagePath, $filename);
    }

    private function canAccessOrganizer(Request $request, Invitation $invitation): bool
    {
        if ($this->verifyAdmin($request)) {
            return true;
        }

        $username = (string) $request->header('X-Organizer-Username');
        $password = (string) $request->header('X-Organizer-Password');

        return $username !== ''
            && $password !== ''
            && hash_equals((string) $invitation->organizer_username, $username)
            && hash_equals((string) $invitation->organizer_password, $password);
    }

    private function guestPhotoStoragePath(GuestPhoto $photo): ?string
    {
        $urlPath = parse_url((string) $photo->image_url, PHP_URL_PATH);
        if (! is_string($urlPath) || ! str_starts_with($urlPath, '/storage/')) {
            return null;
        }

        $storagePath = rawurldecode(ltrim(substr($urlPath, strlen('/storage/')), '/'));

        return str_starts_with($storagePath, 'invitations/guest_photos/')
            && ! str_contains($storagePath, '..')
                ? $storagePath
                : null;
    }

    public function listAdmins(): JsonResponse
    {
        $admins = \Illuminate\Support\Facades\DB::table('admins')
            ->select('id', 'username', 'created_at')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(['data' => $admins]);
    }

    public function createAdmin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:255', 'unique:admins,username'],
            'password' => ['required', 'string', 'min:6', 'max:255'],
        ]);

        $id = \Illuminate\Support\Facades\DB::table('admins')->insertGetId([
            'username' => $validated['username'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'data' => [
                'id' => $id,
                'username' => $validated['username'],
                'created_at' => now(),
            ]
        ], 201);
    }

    public function deleteAdmin(int $id): JsonResponse
    {
        $adminCount = \Illuminate\Support\Facades\DB::table('admins')->count();
        if ($adminCount <= 1) {
            return response()->json(['message' => 'Cannot delete the only remaining admin account.'], 422);
        }

        $admin = \Illuminate\Support\Facades\DB::table('admins')->where('id', $id)->first();
        if ($admin && $admin->username === 'wil') {
            return response()->json(['message' => 'Cannot delete the main admin account (wil).'], 422);
        }

        \Illuminate\Support\Facades\DB::table('admins')->where('id', $id)->delete();

        return response()->json(status: 204);
    }
}
