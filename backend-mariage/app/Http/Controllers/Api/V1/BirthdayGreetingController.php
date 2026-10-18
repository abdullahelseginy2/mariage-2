<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SaveBirthdayGreetingRequest;
use App\Http\Resources\BirthdayGreetingResource;
use App\Models\BirthdayGreeting;
use App\Support\PublicRouteUniqueness;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BirthdayGreetingController extends Controller
{
    public function __construct(private readonly PublicRouteUniqueness $publicRoutes)
    {
    }

    public function index(\Illuminate\Http\Request $request): JsonResponse
    {
        $query = DB::table('birthday_greetings');

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
        $query->orderByDesc('is_demo');
        if ($sort === 'oldest') {
            $query->orderBy('created_at', 'asc');
        } else {
            $query->orderByDesc('created_at');
        }

        $paginator = $query->select('id')->paginate(20);

        $ids = $paginator->getCollection()->pluck('id')->all();
        $rows = empty($ids)
            ? collect()
            : DB::table('birthday_greetings')
                ->select([
                    'id',
                    'code',
                    'slug',
                    'requester_name',
                    'requester_whatsapp',
                    'order_date',
                    'recipient_name',
                    'sender_name',
                    'is_published',
                    'is_demo',
                    'locale',
                    'font_family',
                    'template',
                    'created_at',
                    'updated_at',
                ])
                ->whereIn('id', $ids)
                ->get()
                ->keyBy('id');

        $paginator->setCollection(
            collect($ids)->map(fn ($id) => $this->birthdayListItem((array) $rows->get($id, [])))
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

    public function store(SaveBirthdayGreetingRequest $request): JsonResponse
    {
        $greeting = BirthdayGreeting::create($this->payload($request));

        return (new BirthdayGreetingResource($greeting))
            ->response()
            ->setStatusCode(201);
    }

    public function show(BirthdayGreeting $birthdayGreeting): BirthdayGreetingResource
    {
        return new BirthdayGreetingResource($birthdayGreeting);
    }

    public function update(SaveBirthdayGreetingRequest $request, BirthdayGreeting $birthdayGreeting): BirthdayGreetingResource
    {
        $birthdayGreeting->update($this->payload($request, $birthdayGreeting));

        return new BirthdayGreetingResource($birthdayGreeting->refresh());
    }

    public function destroy(BirthdayGreeting $birthdayGreeting): JsonResponse
    {
        $birthdayGreeting->delete();

        return response()->json(status: 204);
    }

    public function publicShow(string $publicPath): BirthdayGreetingResource
    {
        [$slug, $code] = $this->splitPublicPath($publicPath);

        $greeting = BirthdayGreeting::query()
            ->where('slug', $slug)
            ->where('code', $code)
            ->first();

        if (! $greeting) {
            abort(404, 'Birthday greeting link is invalid or no longer available.');
        }

        if (! $greeting->is_published) {
            abort(403, 'This birthday greeting site is not published yet.');
        }

        return new BirthdayGreetingResource($greeting);
    }

    private function birthdayListItem(array $greeting): array
    {
        $slug = $greeting['slug'] ?? '';
        $code = $greeting['code'] ?? '';

        return [
            'id' => $greeting['id'] ?? null,
            'code' => $code,
            'slug' => $slug,
            'public_path' => $slug !== '' && $code !== '' ? "{$slug}-{$code}" : '',
            'recipient_name' => $greeting['recipient_name'] ?? '',
            'sender_name' => $greeting['sender_name'] ?? '',
            'requester_name' => $greeting['requester_name'] ?? null,
            'requester_whatsapp' => $greeting['requester_whatsapp'] ?? null,
            'order_date' => $greeting['order_date'] ?? null,
            'is_published' => (bool) ($greeting['is_published'] ?? false),
            'is_demo' => (bool) ($greeting['is_demo'] ?? false),
            'locale' => $greeting['locale'] ?? 'en',
            'font_family' => $greeting['font_family'] ?? 'elegant',
            'template' => $greeting['template'] ?? 'default',
            'created_at' => isset($greeting['created_at']) ? (string) $greeting['created_at'] : null,
            'updated_at' => isset($greeting['updated_at']) ? (string) $greeting['updated_at'] : null,
        ];
    }

    private function payload(SaveBirthdayGreetingRequest $request, ?BirthdayGreeting $greeting = null): array
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
            'template' => $validated['template'] ?? $greeting?->template ?? 'default',
            'slug' => $slug,
            'code' => $code,
        ];
    }

    private function routeParts(array $validated, ?BirthdayGreeting $greeting, string $recipientName, string $senderName): array
    {
        if (! empty($validated['public_path'])) {
            return $this->splitPublicPath($validated['public_path']);
        }

        $slug = BirthdayGreeting::makeSlug($recipientName, $senderName);

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
