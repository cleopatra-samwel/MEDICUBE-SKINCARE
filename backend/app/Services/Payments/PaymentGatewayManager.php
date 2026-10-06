<?php

namespace App\Services\Payments;

use InvalidArgumentException;

class PaymentGatewayManager
{
    /** @var array<string, PaymentGateway> */
    private array $resolved = [];

    public function gateway(?string $name = null): PaymentGateway
    {
        $name ??= config('payments.default');

        if (! isset($this->resolved[$name])) {
            $config = config("payments.gateways.$name");
            if (! $config || ! class_exists($config['driver'] ?? '')) {
                throw new InvalidArgumentException("Payment gateway [$name] is not configured.");
            }
            $this->resolved[$name] = new ($config['driver'])($config);
        }

        return $this->resolved[$name];
    }

    public function gatewayForMethod(string $method): string
    {
        $config = config("payments.methods.$method");
        if (! $config || ! ($config['enabled'] ?? false)) {
            throw new InvalidArgumentException("Payment method [$method] is not available.");
        }

        return $config['gateway'];
    }

    /** @return array<int, array{key:string,label:string,description:string}> */
    public function enabledMethods(): array
    {
        return collect(config('payments.methods'))
            ->filter(fn ($m) => $m['enabled'] ?? false)
            ->map(fn ($m, $key) => ['key' => $key, 'label' => $m['label'], 'description' => $m['description']])
            ->values()
            ->all();
    }
}
