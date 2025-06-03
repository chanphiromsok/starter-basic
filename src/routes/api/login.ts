import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { z } from 'zod'
import { authenticateUser } from '~/utils/users'

const loginSchema = z.object({
  usernameOrEmail: z.string().email('Please enter a valid email address'), // Changed to require email format
  password: z.string().min(1, 'Password is required'),
})

export const Route = createAPIFileRoute('/api/login')({
  POST: async ({ request }) => {
    try {
      const body = await request.json()
      
      // Validate input
      const { usernameOrEmail, password } = loginSchema.parse(body)
      
      // Authenticate user
      const user = await authenticateUser(usernameOrEmail, password)
      
      if (!user) {
        return json({
          success: false,
          message: 'Invalid credentials',
        }, { status: 401 })
      }
      
      return json({
        success: true,
        message: 'Login successful',
        user,
      })
      
    } catch (error) {
      console.error('Login error:', error)
      
      if (error instanceof z.ZodError) {
        return json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        }, { status: 400 })
      }
      
      return json({
        success: false,
        message: 'Internal server error',
      }, { status: 500 })
    }
  },
})