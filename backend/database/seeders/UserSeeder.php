<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Administrador',
            'email'    => 'admin@instituto.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'phone'    => '11-1111-1111',
            'active'   => true,
        ]);

        User::create([
            'name'     => 'Prof. Juan Pérez',
            'email'    => 'docente@instituto.com',
            'password' => Hash::make('password'),
            'role'     => 'docente',
            'phone'    => '11-2222-2222',
            'active'   => true,
        ]);

        User::create([
            'name'     => 'Prof. María González',
            'email'    => 'docente2@instituto.com',
            'password' => Hash::make('password'),
            'role'     => 'docente',
            'phone'    => '11-3333-3333',
            'active'   => true,
        ]);

        User::create([
            'name'     => 'Pedro Ramírez',
            'email'    => 'estudiante@instituto.com',
            'password' => Hash::make('password'),
            'role'     => 'estudiante',
            'phone'    => '11-4444-4444',
            'active'   => true,
        ]);

        User::create([
            'name'     => 'Ana López',
            'email'    => 'estudiante2@instituto.com',
            'password' => Hash::make('password'),
            'role'     => 'estudiante',
            'phone'    => '11-5555-5555',
            'active'   => true,
        ]);

        User::create([
            'name'     => 'Carlos Mendoza',
            'email'    => 'estudiante3@instituto.com',
            'password' => Hash::make('password'),
            'role'     => 'estudiante',
            'phone'    => '11-6666-6666',
            'active'   => true,
        ]);
    }
}
