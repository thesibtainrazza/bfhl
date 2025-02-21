import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ operation_code: 1 }, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data } = body

    if (!Array.isArray(data)) {
      return NextResponse.json({ is_success: false, error: "Invalid input: data must be an array" }, { status: 400 })
    }

    const numbers = data.filter((item) => typeof item === "string" && !isNaN(Number(item)))
    const alphabets = data.filter((item) => typeof item === "string" && item.length === 1 && isNaN(Number(item)))
    const highest_alphabet = alphabets.length > 0 ? [alphabets.reduce((a, b) => (a > b ? a : b))] : []

    const response = {
      is_success: true,
      user_id: "Sibtain_Raza",
      email: "thesibtainrazza@gmail.com",
      roll_number: "22BCS13557",
      numbers,
      alphabets,
      highest_alphabet,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ is_success: false, error: "Server error" }, { status: 500 })
  }
}

