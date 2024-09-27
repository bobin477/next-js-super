import {z} from 'zod'

const configSchema = z.object({
   NEXT_PUBLIC_API_ENDPOINT: z.string(),
   PUBLIC_API_ENDPOINT: z.string(),
})

const configProject = configSchema.safeParse(
   {
      NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
      PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_URL,
   }
)

if (!configProject.success) {
   console.error(configProject.error.issues)
   throw new Error('Khai bao bien moi truong khong hop le')

}

const envConfig = configProject.data

export default envConfig