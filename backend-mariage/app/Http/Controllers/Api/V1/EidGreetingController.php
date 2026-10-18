<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SaveEidGreetingRequest;
use App\Http\Resources\EidGreetingResource;
use App\Models\EidGreeting;
use App\Support\PublicRouteUniqueness;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class EidGreetingController extends Controller
{
    public function __construct(private readonly PublicRouteUniqueness $publicRoutes)
    {
    }

    public function index(\Illuminate\Http\Request $request): AnonymousResourceCollection
    {
        $query = EidGreeting::query();

        if ($request->filled('search')) {
            $search = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('recipient_name', 'like', $search)
                  ->orWhere('sender_name', 'like', $search)
                  ->orWhere('requester_name', 'like', $search)
                  ->orWhere('requester_whatsapp', 'like', $search)
                  ->orWhere('slug', 'like', $search)
                  ->orWhere('code', 'like', $search);
            });
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
            $query->oldest();
        } else {
            $query->latest();
        }

        return EidGreetingResource::collection($query->paginate(20));
    }

    public function store(SaveEidGreetingRequest $request): JsonResponse
    {
        $greeting = EidGreeting::create($this->payload($request));

        return (new EidGreetingResource($greeting))
            ->response()
            ->setStatusCode(201);
    }

    public function show(EidGreeting $eidGreeting): EidGreetingResource
    {
        return new EidGreetingResource($eidGreeting);
    }

    public function update(SaveEidGreetingRequest $request, EidGreeting $eidGreeting): EidGreetingResource
    {
        $eidGreeting->update($this->payload($request, $eidGreeting));

        return new EidGreetingResource($eidGreeting->refresh());
    }

    public function destroy(EidGreeting $eidGreeting): JsonResponse
    {
        $eidGreeting->delete();

        return response()->json(status: 204);
    }

    public function publicShow(string $publicPath): EidGreetingResource
    {
        [$slug, $code] = $this->splitPublicPath($publicPath);

        $greeting = EidGreeting::query()
            ->where('slug', $slug)
            ->where('code', $code)
            ->first();

        if (! $greeting) {
            abort(404, 'Eid greeting link is invalid or no longer available.');
        }

        if (! $greeting->is_published) {
            abort(403, 'This Eid greeting site is not published yet.');
        }

        return new EidGreetingResource($greeting);
    }

    private function payload(SaveEidGreetingRequest $request, ?EidGreeting $greeting = null): array
    {
        $validated = $request->validated();
        $recipientName = $validated['recipient_name'];
        $senderName = $validated['sender_name'];
        [$slug, $code] = $this->routeParts($validated, $greeting, $recipientName, $senderName);

        if ($this->publicRoutes->exists($slug, $code, $greeting)) {
            throw ValidationException::withMessages([
                'public_path' => ['This route exists before. Choose another route.'],
            ]);
        }

        return [
            ...Arr::only($validated, ['recipient_name', 'sender_name', 'content']),
            'requester_name' => array_key_exists('requester_name', $validated)
                ? (filled($validated['requester_name'])
                    ? trim((string) $validated['requester_name'])
                    : "{$recipientName} & {$senderName}")
                : ($greeting?->requester_name ?: "{$recipientName} & {$senderName}"),
            'requester_whatsapp' => array_key_exists('requester_whatsapp', $validated)
                ? (filled($validated['requester_whatsapp']) ? trim((string) $validated['requester_whatsapp']) : null)
                : $greeting?->requester_whatsapp,
            'order_date' => $validated['order_date'] ?? $greeting?->order_date ?? now()->toDateString(),
            'is_published' => $validated['is_published'] ?? true,
            'locale' => $validated['locale'] ?? $greeting?->locale ?? 'en',
            'font_family' => $validated['font_family'] ?? $greeting?->font_family ?? 'elegant',
            'slug' => $slug,
            'code' => $code,
        ];
    }

    private function routeParts(array $validated, ?EidGreeting $greeting, string $recipientName, string $senderName): array
    {
        if (! empty($validated['public_path'])) {
            return $this->splitPublicPath($validated['public_path']);
        }

        $slug = EidGreeting::makeSlug($recipientName, $senderName);

        return [$slug, $greeting?->code ?? $this->generateCode($slug)];
    }

    private function splitPublicPath(string $publicPath): array
    {
        if (! preg_match('/^(.*)-(\d{4})$/', $publicPath, $matches)) {
            abort(404);
        }

        return [$matches[1], $matches[2]];
    }

    private function generateCode(string $slug): string
    {
        do {
            $code = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        } while ($this->publicRoutes->exists($slug, $code));

        return $code;
    }
}
