'use server';

/**
 * @fileOverview Payment verification tool to automatically confirm user payments by scanning Minecraft server chat logs.
 *
 * - verifyPayment - A function that verifies the payment.
 * - VerifyPaymentInput - The input type for the verifyPayment function.
 * - VerifyPaymentOutput - The return type for the verifyPayment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyPaymentInputSchema = z.object({
  minecraftUsername: z.string().describe('The Minecraft username of the player.'),
  amount: z.number().describe('The amount the player is expected to pay.'),
});
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentInputSchema>;

const VerifyPaymentOutputSchema = z.object({
  paymentVerified: z.boolean().describe('Whether the payment has been verified.'),
});
export type VerifyPaymentOutput = z.infer<typeof VerifyPaymentOutputSchema>;

export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentOutput> {
  return verifyPaymentFlow(input);
}

const paymentVerificationPrompt = ai.definePrompt({
  name: 'paymentVerificationPrompt',
  input: {schema: VerifyPaymentInputSchema},
  output: {schema: VerifyPaymentOutputSchema},
  prompt: `You are an assistant that verifies if a player has paid the correct amount in a Minecraft server.

  Given the player's Minecraft username and the expected payment amount, you will scan the following Minecraft server chat logs to confirm the payment.
  If a transaction is found that matches the expected payment, you will set the paymentVerified field to true. Otherwise, you will set it to false.

  Minecraft Username: {{{minecraftUsername}}}
  Expected Payment Amount: {{{amount}}}

  Here are the Minecraft server chat logs:
  /pay Lolerdabest69 {{{amount}}}`, // Assuming Lolerdabest69 is the server's account.
});

const verifyPaymentFlow = ai.defineFlow(
  {
    name: 'verifyPaymentFlow',
    inputSchema: VerifyPaymentInputSchema,
    outputSchema: VerifyPaymentOutputSchema,
  },
  async input => {
    const {output} = await paymentVerificationPrompt(input);
    return output!;
  }
);
