import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
            <h2 className="text-4xl font-bold mb-4">Not Found</h2>
            <p className="mb-4">Could not find requested resource</p>
            <Link href="/" className="text-indigo-500 hover:text-indigo-400">
                Return Home
            </Link>
        </div>
    )
}
