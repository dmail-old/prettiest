const promisifyNodeCallback = fn => (...args) =>
	new Promise((resolve, reject) => {
		fn(...args, (error, data) => {
			if (error) {
				reject(error)
			} else {
				resolve(data)
			}
		})
	})
exports.promisifyNodeCallback = promisifyNodeCallback

const promisify = fn => (...args) => new Promise(resolve => resolve(fn(...args)))
exports.promisify = promisify

const promiseSequence = (values, fn) => {
	const promisifiedFn = promisify(fn)
	return values.reduce(
		(previous, value) => previous.then(() => promisifiedFn(value)),
		Promise.resolve()
	)
}
exports.promiseSequence = promiseSequence

const promiseParallel = (values, fn) => Promise.all(values.map(value => fn(value)))
exports.promiseParallel = promiseParallel
