import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'No content.'
  }

  if (error instanceof AxiosError) {
    const title = error.response?.data?.title
    if (typeof title === 'string' && title.length > 0) {
      errMsg = title
    }
  } else if (
    error &&
    typeof error === 'object' &&
    !(error instanceof Error) &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.length > 0
  ) {
    // Supabase PostgrestError is a plain object (not an Error instance)
    // with a human-readable `message` string.
    errMsg = error.message
  }

  toast.error(errMsg)
}
