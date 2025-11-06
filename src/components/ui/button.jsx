import * as React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...i){return twMerge(clsx(i))}

export const Button = React.forwardRef(function Button(
  { className, variant='default', size='md', ...props }, ref
){
  const base='inline-flex items-center justify-center rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[.98]'
  const variants={
    default:'bg-purple-600 text-white hover:bg-purple-700',
    outline:'border border-white text-white bg-transparent hover:bg-white hover:text-black',
    ghost:'bg-transparent text-white hover:bg-white/10'
  }
  const sizes={ sm:'h-9 px-3 text-sm', md:'h-11 px-5 text-base', lg:'h-12 px-6 text-lg' }
  return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
})
