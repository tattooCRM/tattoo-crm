import Footer from '../components/Footer';

function Home() {
    return (
        <>
            <div className="min-h-screen flex flex-col items-center justify-center text-center x-6 bg-gray-100">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-black">InkStudio</h1>
                <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-6">
                    Le CRM tout-en-un pour tattoueurs indépendants et salon : planning, projets, communication Instagram, devis et vitrine pro.
                </p>
                <div className="flex gap-4">
                    <a href="/login" className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                        Se connecter
                    </a>
                    <a href="/signup" className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                        S'inscrire
                    </a>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Home;