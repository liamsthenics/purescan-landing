import { NextRequest, NextResponse } from 'next/server';
import { fatSecretClient } from '@/lib/fatsecret';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const barcode = searchParams.get('barcode');

    if (!barcode) {
        return NextResponse.json({ error: 'Barcode is required' }, { status: 400 });
    }

    try {
        const data = await fatSecretClient.execute('food.find_id_for_barcode', {
            barcode: barcode,
        });
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('FatSecret Search Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
