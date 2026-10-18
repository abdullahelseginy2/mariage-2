<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SaveLoveMessageRequest;
use App\Http\Resources\LoveMessageResource;
use App\Models\LoveMessage;
use App\Support\PublicRouteUniqueness;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class LoveMessageController extends Controller
{
    public function __construct(private readonly PublicRouteUniqueness $publicRoutes)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = LoveMessage::query();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(fn ($builder) => $builder
                ->where('recipient_name', 'like', "%{$search}%")
                ->orWhere('sender_name', 'like', "%{$search}%")
                ->orWhere('requester_name', 'like', "%{$search}%")
                ->orWhere('requester_whatsapp', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%"));
        }

        if ($request->filled('template')) {
            $query->where('template', $request->input('template'));
        }

        if ($request->filled('is_demo')) {
            $request->boolean('is_demo')
                ? $query->where('is_demo', true)
                : $query->where('is_demo', false);
        }

        if ($request->filled('date')) {
            $query->whereDate('order_date', $request->input('date'));
        }

        $query->orderByDesc('is_demo');
        $request->input('sort', 'latest') === 'oldest'
            ? $query->oldest()
            : $query->latest();

        return response()->json(LoveMessageResource::collection($query->paginate(20))->response()->getData(true));
    }

    public function store(SaveLoveMessageRequest $request): JsonResponse
    {
        return (new LoveMessageResource(LoveMessage::create($this->payload($request))))
            ->response()
            ->setStatusCode(201);
    }

    public function show(LoveMessage $loveMessage): LoveMessageResource
    {
        return new LoveMessageResource($loveMessage);
    }

    public function update(SaveLoveMessageRequest $request, LoveMessage $loveMessage): LoveMessageResource
    {
        $loveMessage->update($this->payload($request, $loveMessage));

        return new LoveMessageResource($loveMessage->refresh());
    }

    public function destroy(LoveMessage $loveMessage): JsonResponse
    {
        $loveMessage->delete();

        return response()->json(status: 204);
    }

    public function publicShow(string $publicPath): LoveMessageResource
    {
        [$slug, $code] = $this->splitPublicPath($publicPath);
        $message = LoveMessage::query()->where('slug', $slug)->where('code', $code)->first();

        if (! $message) {
            abort(404, 'Love message link is invalid or no longer available.');
        }

        if (! $message->is_published) {
            abort(403, 'This love message is not published yet.');
        }

        return new LoveMessageResource($message);
    }

    private function payload(SaveLoveMessageRequest $request, ?LoveMessage $message = null): array
    {
        $validated = $request->validated();
        [$slug, $code] = $this->routeParts($validated, $message);

        if ($this->publicRoutes->exists($slug, $code, $message)) {
            throw ValidationException::withMessages([
                'public_path' => ['This route exists before. Choose another route.'],
            ]);
        }

        return [
            ...Arr::only($validated, ['recipient_name', 'sender_name', 'content']),
            'requester_name' => array_key_exists('requester_name', $validated)
                ? (filled($validated['requester_name'])
                    ? trim((string) $validated['requester_name'])
                    : "{$validated['recipient_name']} & {$validated['sender_name']}")
                : ($message?->requester_name ?: "{$validated['recipient_name']} & {$validated['sender_name']}"),
            'requester_whatsapp' => array_key_exists('requester_whatsapp', $validated)
                ? (filled($validated['requester_whatsapp']) ? trim((string) $validated['requester_whatsapp']) : null)
                : $message?->requester_whatsapp,
            'order_date' => $validated['order_date'] ?? $message?->order_date ?? now()->toDateString(),
            'is_published' => $validated['is_published'] ?? true,
            'locale' => $validated['locale'] ?? $message?->locale ?? 'en',
            'font_family' => $validated['font_family'] ?? $message?->font_family ?? 'elegant',
            'template' => $validated['template'] ?? $message?->template ?? 'happy-message',
            'slug' => $slug,
            'code' => $code,
        ];
    }

    private function routeParts(array $validated, ?LoveMessage $message): array
    {
        if (! empty($validated['public_path'])) {
            return $this->splitPublicPath($validated['public_path']);
        }

        $slug = LoveMessage::makeSlug($validated['recipient_name'], $validated['sender_name']);

        return [$slug, $message?->code ?? $this->generateCode($slug)];
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
