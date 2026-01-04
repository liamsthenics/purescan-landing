import { NextRequest, NextResponse } from 'next/server';
import { fatSecretClient } from '@/lib/fatsecret';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const foodId = searchParams.get('food_id');

    if (!foodId) {
        return NextResponse.json({ error: 'food_id is required' }, { status: 400 });
    }

    try {
        const data = await fatSecretClient.execute('food.get.v2', {
            food_id: foodId,
        });
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('FatSecret Details Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
