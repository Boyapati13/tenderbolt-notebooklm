import { NextRequest, NextResponse } from 'next/server';

/**
 * API Endpoint for Product Search (DEBUGGING VERSION)
 *
 * This version is a simplified test to ensure the API route is working correctly.
 * It will catch any error and return a JSON response instead of crashing.
 */

// --- Main Search Endpoint (POST) ---
export async function POST(request: NextRequest) {
  try {
    // 1. Log that the endpoint was hit to confirm it's reachable.
    console.log('--- PRODUCT SEARCH API (DEBUG MODE) --- ');
    console.log('POST request received.');

    // 2. Try to parse the request body to check for JSON errors.
    const payload = await request.json();
    console.log('Request payload parsed successfully:', payload);

    // 3. If successful, return a confirmation response.
    return NextResponse.json({
      success: true,
      message: 'API endpoint is functioning correctly. Ready for real logic.',
      receivedPayload: payload,
    });

  } catch (error: any) {
    // 4. If ANY error occurs, catch it, log it, and return a proper JSON error.
    //    This prevents the "Internal Server Error" page.
    console.error('!!! CRITICAL ERROR IN PRODUCT SEARCH API !!!', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred on the server.',
        errorMessage: error.message,
      },
      { status: 500 }
    );
  }
}

// --- Health Check Endpoint (GET) ---
export async function GET() {
  console.log('--- PRODUCT SEARCH API (DEBUG MODE) --- ');
  console.log('GET request received for health check.');
  return NextResponse.json({
    success: true,
    message: 'Product search API is running and reachable via GET.',
  });
}
