import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
    return (
        <header className="bg-gray-900 py-4">
            <div className="container mx-auto flex items-center justify-center">
                <Link href="https://quinta0.github.io/nmsportal/" className="flex items-center">
                    <Image
                        src="logo.png"
                        alt="No Man's Sky Logo"
                        width={50}
                        height={50}
                        className="mr-4"
                    />
                    <h1 className="text-2xl font-bold text-white">No Man's Sky Portal Address Tool</h1>
                </Link>
            </div>
        </header>
    );
};

export default Header;