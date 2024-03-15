const args = process.argv.slice(2)

// Process arguments
if (args.length === 0) {
  console.log('No arguments provided.')
} else {
  console.log('Arguments provided:')
  args.forEach((arg, index) => {
    console.log(`${index + 1}: ${arg}`)
  })
}

console.log(args)
