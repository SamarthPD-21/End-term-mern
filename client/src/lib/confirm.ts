import { toast } from 'react-toastify'
import React from 'react'

export function confirmWithToast(
	message: string,
	opts?: { confirmText?: string; cancelText?: string; timeout?: number }
): Promise<boolean> {
	const confirmText = opts?.confirmText ?? 'OK'
	const cancelText = opts?.cancelText ?? 'Cancel'
	const timeout = typeof opts?.timeout === 'number' ? opts.timeout : 8000

	return new Promise((resolve) => {
		// create the toast content without JSX so this file can be a .ts module
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const idRef: { current?: any } = {}
		const content = () =>
			React.createElement(
				'div',
				{ className: 'flex items-center gap-4' },
				React.createElement('div', { className: 'flex-1 text-sm' }, message),
				React.createElement(
					'div',
					{ className: 'flex items-center gap-2' },
					React.createElement(
						'button',
						{
							className: 'px-3 py-1 rounded bg-gray-200 text-sm',
										onClick: () => {
												if (idRef.current) toast.dismiss(idRef.current)
												resolve(false)
											},
						},
						cancelText
					),
					React.createElement(
						'button',
						{
							className: 'px-3 py-1 rounded bg-red-600 text-white text-sm',
										onClick: () => {
												if (idRef.current) toast.dismiss(idRef.current)
												resolve(true)
											},
						},
						confirmText
					)
				)
			)

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		idRef.current = toast.info(content as any, { autoClose: timeout }) as any

		if (timeout > 0) {
			setTimeout(() => {
								try {
									if (idRef.current) toast.dismiss(idRef.current)
								} catch {
									// ignore
								}
				resolve(false)
			}, timeout + 50)
		}
	})
}

export default confirmWithToast
