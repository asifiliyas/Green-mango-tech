import NextAuth from "next-auth"
import { authOptions } from "../../../../lib/auth-constants"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
