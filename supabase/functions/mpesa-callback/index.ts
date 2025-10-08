import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CallbackMetadata {
  Item: Array<{
    Name: string;
    Value: string | number;
  }>;
}

interface StkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: CallbackMetadata;
}

interface CallbackPayload {
  Body: {
    stkCallback: StkCallback;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: CallbackPayload = await req.json();
    const stkCallback = payload.Body.stkCallback;

    console.log("M-Pesa Callback received:", JSON.stringify(stkCallback, null, 2));

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    let mpesaReceiptNumber = null;
    let transactionDate = null;
    let phoneNumber = null;
    let amount = null;

    if (ResultCode === 0 && CallbackMetadata) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === "MpesaReceiptNumber") {
          mpesaReceiptNumber = item.Value as string;
        } else if (item.Name === "TransactionDate") {
          const dateStr = String(item.Value);
          const year = dateStr.substring(0, 4);
          const month = dateStr.substring(4, 6);
          const day = dateStr.substring(6, 8);
          const hour = dateStr.substring(8, 10);
          const minute = dateStr.substring(10, 12);
          const second = dateStr.substring(12, 14);
          transactionDate = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
        } else if (item.Name === "PhoneNumber") {
          phoneNumber = item.Value as string;
        } else if (item.Name === "Amount") {
          amount = item.Value as number;
        }
      }
    }

    const status = ResultCode === 0 ? "completed" : "failed";

    const updateData: any = {
      result_code: ResultCode,
      result_desc: ResultDesc,
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (mpesaReceiptNumber) {
      updateData.mpesa_receipt_number = mpesaReceiptNumber;
    }
    if (transactionDate) {
      updateData.transaction_date = transactionDate;
    }
    if (phoneNumber || amount) {
      updateData.metadata = {
        callback_phone: phoneNumber,
        callback_amount: amount,
      };
    }

    const { data, error } = await supabaseClient
      .from("mpesa_transactions")
      .update(updateData)
      .eq("checkout_request_id", CheckoutRequestID)
      .select();

    if (error) {
      console.error("Database update error:", error);
      return new Response(
        JSON.stringify({
          ResultCode: 1,
          ResultDesc: "Failed to update transaction",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Transaction updated successfully:", data);

    return new Response(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: "Success",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in mpesa-callback:", error);
    return new Response(
      JSON.stringify({
        ResultCode: 1,
        ResultDesc: "Internal server error",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
