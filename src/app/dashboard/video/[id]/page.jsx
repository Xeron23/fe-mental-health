import React from "react";
import VideoPage from "@/components/video/details";
import Navbar from "@/components/navbar/page";
import Breadcrumb from "@/components/breadcrumb/page";
import VideoCards from "@/components/video/card";
import Footer from "@/components/footer/page";

const Vids = () => {
  return (
    <div>
      <Navbar />
      <div className="p-6 md:px-20 md:py-12">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Video" },
          ]}
        />
      </div>

      <VideoPage /> 
      <br />
      <h1 className="text-2xl font-semibold ml-15 font-stretch-75% p-6">
        Video Lainnya
      </h1>
      <div className="px-10">
        <VideoCards />
      </div>
        <Footer/>
    </div>
  );
};

export default Vids;
