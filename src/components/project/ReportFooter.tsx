
import { getArchitectInfo } from "@/components/services/reportService";
import { useEffect, useState } from "react";
import { ArchitectInfo } from "@/components/services/types";

const ReportFooter = () => {
  const [architectInfo, setArchitectInfo] = useState<ArchitectInfo | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const info = await getArchitectInfo();
        setArchitectInfo(info);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, []);
  
  if (!architectInfo) return null;
  
  return (
    <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground print:mt-10">
      <div className="flex justify-center mb-2">
        {architectInfo.logo && (
          <img 
            src={architectInfo.logo} 
            alt={`${architectInfo.name} logo`} 
            className="h-8 object-contain" 
          />
        )}
      </div>
      <p>{architectInfo.name} - {architectInfo.address}</p>
      <p>{architectInfo.phone} - {architectInfo.email}</p>
      <p className="mt-2">Ce document est confidentiel et destiné uniquement aux parties concernées.</p>
      <p>Version imprimée non contrôlée - Page 1 de 1</p>
    </div>
  );
};

export default ReportFooter;
