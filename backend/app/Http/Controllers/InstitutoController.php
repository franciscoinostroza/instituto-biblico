<?php

namespace App\Http\Controllers;

use App\Http\Requests\Instituto\UpdateInstitutoRequest;
use App\Models\Instituto;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class InstitutoController extends Controller
{
    public function show(): JsonResponse
    {
        $instituto = Instituto::firstOrCreate([], ['name' => 'Instituto Bíblico']);
        return response()->json($instituto);
    }

    public function update(UpdateInstitutoRequest $request): JsonResponse
    {
        $instituto = Instituto::firstOrCreate([], ['name' => 'Instituto Bíblico']);
        $data      = $request->validated();

        if ($request->hasFile('logo')) {
            if ($instituto->logo) Storage::disk('s3')->delete($instituto->logo);
            $data['logo'] = $request->file('logo')->store('instituto', 's3');
        }

        unset($data['logo_file']);
        $instituto->update($data);

        return response()->json($instituto);
    }
}
