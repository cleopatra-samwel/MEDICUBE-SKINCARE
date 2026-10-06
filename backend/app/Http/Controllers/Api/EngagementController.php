<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EngagementController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email', 'max:255']]);
        NewsletterSubscriber::query()->updateOrCreate(['email' => strtolower($data['email'])], ['unsubscribed_at' => null]);

        return response()->json(['message' => 'You are subscribed. Watch your inbox for new launches.']);
    }

    public function contact(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'subject' => ['nullable', 'string', 'max:150'],
            'message' => ['required', 'string', 'min:10', 'max:3000'],
        ]);
        ContactMessage::create($data);

        return response()->json(['message' => 'Message sent. We reply within one working day.'], 201);
    }
}
