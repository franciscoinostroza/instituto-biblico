<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Administrador',        'email' => 'admin@instituto.com',      'role' => 'admin',      'phone' => '11-1111-1111'],
            ['name' => 'Prof. Juan Pérez',      'email' => 'docente@instituto.com',    'role' => 'docente',    'phone' => '11-2222-2222'],
            ['name' => 'Prof. María González',  'email' => 'docente2@instituto.com',   'role' => 'docente',    'phone' => '11-3333-3333'],
            ['name' => 'Pedro Ramírez',         'email' => 'estudiante@instituto.com', 'role' => 'estudiante', 'phone' => '11-4444-4444'],
            ['name' => 'Ana López',             'email' => 'estudiante2@instituto.com','role' => 'estudiante', 'phone' => '11-5555-5555'],
            ['name' => 'Carlos Mendoza',        'email' => 'estudiante3@instituto.com','role' => 'estudiante', 'phone' => '11-6666-6666'],
        ];

        foreach ($users as $data) {
            User::firstOrCreate(
                ['email' => $data['email']],
                array_merge($data, ['password' => Hash::make('password'), 'active' => true])
            );
        }
    }
}
