<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class SaveLoveMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'recipient_name' => ['required', 'string', 'max:120'],
            'sender_name' => ['required', 'string', 'max:120'],
            'public_path' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*-\d{4}$/'],
            'requester_name' => ['nullable', 'string', 'max:180'],
            'requester_whatsapp' => ['nullable', 'string', 'max:32', 'regex:/^[0-9+()\-\s]*$/'],
            'order_date' => ['nullable', 'date_format:Y-m-d'],
            'is_published' => ['sometimes', 'boolean'],
            'locale' => ['sometimes', 'string', 'in:en,ar'],
            'font_family' => ['sometimes', 'string', 'in:elegant,romantic,modern,classic,playful,cheerful,sunny,bloom'],
            'template' => ['sometimes', 'nullable', 'string', 'in:happy-message'],
            'content' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'public_path.regex' => 'The love message route must use words separated by dashes and end with four digits.',
        ];
    }
}
