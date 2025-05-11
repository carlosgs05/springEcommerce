import { FaRocket, FaChartLine, FaShieldAlt, FaHandHoldingHeart, FaLightbulb, FaTruck, FaCreditCard, FaHeadset, FaAward, FaChevronDown } from 'react-icons/fa';
import { useState } from 'react';
import Header from "../Header";
import Footer from "../Footer";

const Nosotros = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const stats = [
        { id: 1, value: "10+", label: "Años en el mercado" },
        { id: 2, value: "50k+", label: "Productos vendidos" },
        { id: 3, value: "95%", label: "Clientes satisfechos" },
        { id: 4, value: "150+", label: "Marcas asociadas" },
    ];

    const benefits = [
        { 
            id: 1, 
            icon: <FaTruck className="text-4xl" />, 
            title: "Envío Rápido", 
            description: "Entrega garantizada en 24-48 horas a las principales ciudades del país." 
        },
        { 
            id: 2, 
            icon: <FaCreditCard className="text-4xl" />, 
            title: "Pagos Seguros", 
            description: "Múltiples métodos de pago con la más alta seguridad y encriptación." 
        },
        { 
            id: 3, 
            icon: <FaHeadset className="text-4xl" />, 
            title: "Soporte 24/7", 
            description: "Atención al cliente disponible todos los días a cualquier hora." 
        },
        { 
            id: 4, 
            icon: <FaAward className="text-4xl" />, 
            title: "Garantía Extendida", 
            description: "Todos nuestros productos incluyen garantía superior a la del mercado." 
        },
    ];

    const faqs = [
        {
            id: 1,
            question: "¿Cuánto tiempo tarda en llegar mi pedido?",
            answer: "Los tiempos de entrega varían según tu ubicación. Para las principales ciudades, el tiempo estimado es de 24-48 horas. Para zonas rurales o remotas, puede tomar entre 3-5 días hábiles."
        },
        {
            id: 2,
            question: "¿Qué métodos de pago aceptan?",
            answer: "Aceptamos todas las tarjetas de crédito y débito principales (Visa, MasterCard, American Express), PayPal, transferencias bancarias y pago contra entrega en algunas localidades."
        },
        {
            id: 3,
            question: "¿Cómo puedo hacer seguimiento a mi pedido?",
            answer: "Una vez realizada tu compra, recibirás un correo electrónico con un número de seguimiento y un enlace donde podrás verificar el estado de tu envío en tiempo real."
        },
        {
            id: 4,
            question: "¿Tienen política de devoluciones?",
            answer: "Sí, ofrecemos 30 días para devoluciones. Si no estás satisfecho con tu compra, puedes devolverla en su empaque original para un reembolso completo o cambio por otro producto."
        },
        {
            id: 5,
            question: "¿Los productos tienen garantía?",
            answer: "Todos nuestros productos cuentan con garantía del fabricante, y además ofrecemos una garantía extendida de TechShop por 12 meses adicionales en la mayoría de nuestros artículos."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-cyan-600 to-blue-800 text-white py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-down">
                        Sobre TechShop
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
                        Innovando en tecnología para llevar lo mejor hasta tus manos
                    </p>
                    <a 
                        href="/tienda" 
                        className="inline-block bg-cyan-400 hover:bg-cyan-300 text-gray-900 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                        Explorar Tienda
                    </a>
                </div>
            </section>

            {/* Misión y Visión */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12">
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="text-cyan-400 mb-4">
                            <FaRocket className="text-5xl" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Nuestra Misión</h2>
                        <p className="text-gray-600 text-lg">
                            Democratizar el acceso a la tecnología de última generación, ofreciendo productos
                            de calidad con precios competitivos y un servicio excepcional.
                        </p>
                    </div>
                    
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="text-cyan-400 mb-4">
                            <FaChartLine className="text-5xl" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Nuestra Visión</h2>
                        <p className="text-gray-600 text-lg">
                            Ser líderes en innovación tecnológica en Latinoamérica, creando una comunidad
                            apasionada por el avance tecnológico y el desarrollo sostenible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Beneficios de comprar con nosotros */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12">Beneficios de comprar con nosotros</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map(benefit => (
                            <div 
                                key={benefit.id}
                                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-center"
                            >
                                <div className="text-cyan-400 mb-4">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                                <p className="text-gray-600">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Estadísticas */}
            <section className="bg-gradient-to-br from-gray-900 to-stone-800 text-white py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {stats.map(stat => (
                            <div key={stat.id} className="p-6">
                                <div className="text-4xl font-bold mb-2 text-cyan-400">{stat.value}</div>
                                <div className="text-gray-300 uppercase text-sm tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Valores */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12">Nuestros Valores</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="text-cyan-400 mb-4">
                                <FaShieldAlt className="text-4xl" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Integridad</h3>
                            <p className="text-gray-600">
                                Operamos con transparencia y ética en todas nuestras relaciones comerciales.
                            </p>
                        </div>
                        
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="text-cyan-400 mb-4">
                                <FaHandHoldingHeart className="text-4xl" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Enfoque al Cliente</h3>
                            <p className="text-gray-600">
                                Tu satisfacción es nuestra prioridad. Escuchamos y mejoramos constantemente.
                            </p>
                        </div>
                        
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="text-cyan-400 mb-4">
                                <FaLightbulb className="text-4xl" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Innovación</h3>
                            <p className="text-gray-600">
                                Buscamos constantemente nuevas formas de mejorar y sorprender.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ - Acordeón */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="flex justify-between items-center w-full p-5 text-left bg-white hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                                >
                                    <span className="text-lg font-semibold">{faq.question}</span>
                                    <FaChevronDown 
                                        className={`transition-transform duration-300 text-cyan-400 ${activeIndex === index ? 'transform rotate-180' : ''}`} 
                                    />
                                </button>
                                <div 
                                    className={`px-5 py-0 bg-gray-50 transition-all duration-300 ${activeIndex === index ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}
                                >
                                    <p className="text-gray-600 pb-4">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Nosotros;
