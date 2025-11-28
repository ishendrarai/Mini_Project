import React from 'react'
export default function Button({ children, variant = 'primary', ...rest }) {
  return <button className={`btn ${variant === 'primary' ? 'primary' : ''} ${variant === 'danger' ? 'danger' : ''}`} {...rest}>{children}</button>
}
