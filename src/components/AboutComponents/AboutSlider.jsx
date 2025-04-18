import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BsArrowLeft } from "react-icons/bs";
import image1 from "../../assets/aboutBanner/1.jpg"
import image2 from "../../assets/aboutBanner/2.jpg"
import image3 from "../../assets/aboutBanner/3.jpg"


const AboutSlider = () => {
    const [showPrev, setShowPrev] = React.useState(false);

    const settings = {
        className: "center",
        centerMode: true,
        infinite: true,
        slidesToShow: 1,
        speed: 500,
        autoplay: false,
        dots: true,
        arrows: true,
        nextArrow: <NextArrow onNextClick={() => setShowPrev(true)} />,
        prevArrow: showPrev ? <PrevArrow /> : null,
        responsive: [
            {
                breakpoint: 2000, // 3xl
                settings: {
                    centerPadding: "400px",
                }
            },
            {
                breakpoint: 1536, // 2xl
                settings: {
                    centerPadding: "200px",
                }
            },
            {
                breakpoint: 1280, // xl
                settings: {
                    centerPadding: "300px",
                }
            },
            {
                breakpoint: 1024, // lg
                settings: {
                    centerPadding: "100px",
                }
            },
            {
                breakpoint: 768, // md
                settings: {
                    centerPadding: "100px",
                }
            },
            {
                breakpoint: 640, // sm
                settings: {
                    centerPadding: "40px",
                    arrows: false,
                }
            }
        ]
    };

    const slides = [
        {
            image: image1,
            title: "Welcome to Bangladesh",
            description: "Explore the vibrant culture and business opportunities."
        },
        {
            image: image2,
            title: "Business Hub",
            description: "Bangladesh is emerging as a leading trade center."
        },
        {
            image: image3,
            title: "Growing Economy",
            description: "Invest in the future with strong economic growth."
        }
    ];

    // Custom arrow components
    function NextArrow(props) {
        const { onClick, onNextClick } = props;
        return (
            <button
                onClick={() => {
                    onClick();
                    onNextClick();
                }}
                className="text-2xl lg:text-4xl absolute md:right-[10%] lg:right-[6%] xl:right-[10%] 2xl:right-[18%] top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-white md:p-2 lg:p-6 xl:p-8 2xl:p-12 rounded-full shadow-md transition-all"
            >
                <BsArrowLeft className="scale-x-[-1] text-zinc-700" />
            </button>
        );
    }

    function PrevArrow(props) {
        const { onClick } = props;
        return (
            <button
                onClick={onClick}
                className="text-2xl lg:text-4xl absolute md:left-[10%] lg:left-[6%] xl:left-[10%] 2xl:left-[18%] top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-white md:p-2 lg:p-6 xl:p-8 2xl:p-12 rounded-full shadow-md transition-all"
            >
                <BsArrowLeft className="text-zinc-700" />
            </button>
        );
    }

    return (
        <div className="w-full overflow-hidden">
            <Slider {...settings}>
                {slides.map((item, index) => (
                    <div key={index} className="px-2 lg:px-6 2xl:px-8 ">
                        <img
                            src={item?.image}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-[200px] sm:h-[300px] md:h-[255px] lg:h-[355px] xl:h-[455px] rounded-3xl shadow-lg object-cover"
                        />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default AboutSlider;
