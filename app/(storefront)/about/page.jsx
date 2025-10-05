import React from "react";
import FeatherIcon from "@/components/FeatherIcon";
import Image from "next/image";

export default function AboutUsPage() {
  const teamMembers = [
    {
      id: 1,
      name: "محمد الخولي",
      role: "المؤسس والرئيس التنفيذي",
      image: "/team/mohamed.jpg",
      bio: "خبير في التجارة الإلكترونية مع أكثر من 10 سنوات من الخبرة في بناء وتطوير المتاجر الرقمية الناجحة.",
      social: {
        twitter: "#",
        linkedin: "#",
        instagram: "#",
      },
    },
    {
      id: 2,
      name: "سارة أحمد",
      role: "مديرة التسويق",
      image: "/team/sara.jpg",
      bio: "متخصصة في التسويق الرقمي واستراتيجيات العلامات التجارية مع شغف لبناء علاقات مع العملاء.",
      social: {
        twitter: "#",
        linkedin: "#",
        instagram: "#",
      },
    },
    {
      id: 3,
      name: "علي حسن",
      role: "رئيس قسم التكنولوجيا",
      image: "/team/ali.jpg",
      bio: "مطور full-stack مع خبرة في أحدث التقنيات وبناء أنظمة قابلة للتطوير وآمنة.",
      social: {
        twitter: "#",
        linkedin: "#",
        instagram: "#",
      },
    },
    {
      id: 4,
      name: "فاطمة عمر",
      role: "مديرة خدمة العملاء",
      image: "/team/fatima.jpg",
      bio: "متفانية في تقديم تجربة عملاء استثنائية وبناء ثقة دائمة مع مجتمعنا.",
      social: {
        twitter: "#",
        linkedin: "#",
        instagram: "#",
      },
    },
  ];

  const values = [
    {
      icon: "shield",
      title: "الجودة والموثوقية",
      description:
        "نضمن منتجات عالية الجودة مع ضمانات كاملة وخدمة ما بعد البيع مميزة.",
    },
    {
      icon: "users",
      title: "رضا العملاء",
      description:
        "عميلنا هو شريك نجاحنا، نسعى دائمًا لتجاوز توقعاته وتقديم أفضل تجربة.",
    },
    {
      icon: "trending-up",
      title: "التطوير المستمر",
      description:
        "نواكب أحدث trends في عالم التجارة الإلكترونية لنقدم دائماً الأفضل.",
    },
    {
      icon: "heart",
      title: "المسؤولية المجتمعية",
      description:
        "نساهم في تنمية المجتمع من خلال مبادرات مستدامة وبرامج مسؤولية اجتماعية.",
    },
  ];

  const stats = [
    { number: "50,000+", label: "عميل راضي" },
    { number: "100,000+", label: "طلب ناجح" },
    { number: "95%", label: "معدل الرضا" },
    { number: "24/7", label: "دعم عملاء" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[tajawal] text-4xl md:text-5xl font-bold mb-6">
            قصتنا ورحلة نجاحنا
          </h1>
          <p className="font-[tajawal] text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            منذ عام 2015، نسعى لتحويل تجربة التسوق الإلكتروني إلى رحلة استثنائية
            من الثقة والجودة
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-[tajawal] font-medium hover:bg-gray-100 transition-colors duration-300">
              تصفح منتجاتنا
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-[tajawal] font-medium hover:bg-white hover:text-blue-600 transition-colors duration-300">
              تواصل معنا
            </button>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-[tajawal] text-3xl font-bold text-gray-800 mb-6">
                من فكرة بسيطة إلى منصة رائدة
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className="font-[tajawal]">
                  بدأت رحلتنا بشغف بسيط لتقديم تجربة تسوق إلكتروني استثنائية
                  للعالم العربي. من متجر صغير إلى منصة رائدة، كنا ولا زلنا نؤمن
                  بأن نجاحنا مرتبط برضاكم وثقتكم.
                </p>
                <p className="font-[tajawal]">
                  اليوم، نفخر بأننا أصبحنا وجهة موثوقة للآلاف من العملاء الذين
                  يثقون بنا في تلبية احتياجاتهم اليومية بجودة استثنائية وأسعار
                  تنافسية.
                </p>
                <p className="font-[tajawal]">
                  رحلتنا مستمرة نحو الابتكار والتطوير، لأننا نؤمن أن الأفضل
                  دائماً قادم.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-blue-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2 font-[tajawal]">
                        {stat.number}
                      </div>
                      <div className="text-gray-600 font-[tajawal] text-sm">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-[tajawal] text-3xl font-bold text-gray-800 mb-4">
              قيمنا التي نؤمن بها
            </h2>
            <p className="font-[tajawal] text-gray-600 max-w-2xl mx-auto">
              هذه المبادئ توجه كل قرار نتخذه وكل action نقوم به في رحلتنا
              لخدمتكم
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FeatherIcon
                    name={value.icon}
                    size={24}
                    className="text-blue-500"
                  />
                </div>
                <h3 className="font-[tajawal] font-bold text-gray-800 mb-3">
                  {value.title}
                </h3>
                <p className="font-[tajawal] text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-[tajawal] text-3xl font-bold text-gray-800 mb-4">
              فريقنا المتميز
            </h2>
            <p className="font-[tajawal] text-gray-600 max-w-2xl mx-auto">
              مجموعة من المحترفين المتخصصين الذين يعملون معًا لتحقيق رؤيتنا
              المشتركة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl shadow-sm p-6 text-center"
              >
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 relative overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-[tajawal] font-bold text-gray-800 mb-2">
                  {member.name}
                </h3>
                <p className="font-[tajawal] text-blue-600 text-sm mb-4">
                  {member.role}
                </p>
                <p className="font-[tajawal] text-gray-600 text-sm mb-6 leading-relaxed">
                  {member.bio}
                </p>
                <div className="flex justify-center gap-3">
                  <a
                    href={member.social.twitter}
                    className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                  >
                    <FeatherIcon name="twitter" size={18} />
                  </a>
                  <a
                    href={member.social.linkedin}
                    className="text-gray-400 hover:text-blue-700 transition-colors duration-200"
                  >
                    <FeatherIcon name="linkedin" size={18} />
                  </a>
                  <a
                    href={member.social.instagram}
                    className="text-gray-400 hover:text-pink-600 transition-colors duration-200"
                  >
                    <FeatherIcon name="instagram" size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[tajawal] text-3xl font-bold mb-6">
            انضم إلى رحلتنا الاستثنائية
          </h2>
          <p className="font-[tajawal] text-xl mb-8 opacity-90">
            اكتشف عالمًا من الجودة والثقة مع آلاف العملاء الذين يثقون بنا يوميًا
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-[tajawal] font-medium hover:bg-gray-100 transition-colors duration-300">
              ابدأ التسوق الآن
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-[tajawal] font-medium hover:bg-white hover:text-blue-600 transition-colors duration-300">
              تعرف على المزيد
            </button>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FeatherIcon name="heart" size={20} className="text-red-400" />
            <span className="font-[tajawal]">صنع بكل حب لخدمتكم</span>
          </div>
          <p className="font-[tajawal] text-gray-400 text-sm">
            © 2024 متجرنا. جميع الحقوق محفوظة. نعمل每一天 لخدمتكم лучше.
          </p>
        </div>
      </footer>
    </div>
  );
}
