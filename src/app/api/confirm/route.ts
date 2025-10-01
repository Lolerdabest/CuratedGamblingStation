import { confirmBet } from '@/lib/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const betId = searchParams.get('betId');

  if (!betId) {
    return NextResponse.json({ error: 'Bet ID is required' }, { status: 400 });
  }

  const result = await confirmBet(betId);

  if (!result.success) {
    return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Confirmation Failed</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: sans-serif; background-color: #1a1a1a; color: #f0f0f0; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              .container { text-align: center; padding: 2rem; border-radius: 8px; background-color: #2a2a2a; box-shadow: 0 4px 8px rgba(0,0,0,0.3); }
              h1 { color: #ff4d4d; }
              p { color: #ccc; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Error</h1>
              <p>${result.error || 'An unknown error occurred.'}</p>
            </div>
          </body>
        </html>
      `,
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    );
  }
  
  const bet = result.bet;

  return new NextResponse(
    `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bet Confirmed</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: sans-serif; background-color: #1a1a1a; color: #f0f0f0; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .container { text-align: center; padding: 2rem; border-radius: 8px; background-color: #2a2a2a; box-shadow: 0 4px 8px rgba(0,0,0,0.3); }
            h1 { color: #4dff4d; }
            p { color: #ccc; }
            span { font-weight: bold; color: #fff; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Bet Confirmed!</h1>
            <p>The bet for player <span>${bet?.userId}</span> for the amount of <span>${bet?.amount.toLocaleString()}</span> has been confirmed.</p>
            <p>They can now play their game.</p>
          </div>
        </body>
      </html>
    `,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  );
}
