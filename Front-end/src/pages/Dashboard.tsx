  import GridContainer from "../components/GridContainer";
  import LoginLightbox from "../components/LoginLightbox";
  import DashboardHero from "../components/dashboard/DashboardHero";
  import DashboardTools from "../components/dashboard/DashboardTools";
  import DashboardTable from "../components/dashboard/DashboardTable";
  import { useState, useMemo } from "react";
  import "./styles/Dashboard.css";
  import type { Warranty } from "../types/dashboard";
  
  interface DashProps {
    isLoggedIn?: boolean;
  }
  
  const Dashboard = ({ isLoggedIn }: DashProps) => {
    // Lista originală de garanții (nesortată și nefiltrată)
    const originalWarranties = useMemo<Warranty[]>(() =>[
      // Dispozitivele existente...
      // ... 
      {
        prdName: "Dell XPS 15",
        dataExp: "15.01.2026",
        dataCump: "15.01.2023",
        comp: "Media Galaxy",
      },
      {
        prdName: "HP Spectre x360",
        dataExp: "20.02.2025",
        dataCump: "20.02.2023",
        comp: "Flanco",
      },
      {
        prdName: "Lenovo ThinkPad X1 Carbon",
        dataExp: "10.03.2027",
        dataCump: "10.03.2024",
        comp: "PC Garage",
      },
      {
        prdName: "Samsung Galaxy Tab S8",
        dataExp: "05.05.2026",
        dataCump: "05.05.2023",
        comp: "Altex",
      },
      {
        prdName: "Microsoft Surface Laptop 4",
        dataExp: "12.06.2027",
        dataCump: "12.06.2024",
        comp: "Emag",
      },
      {
        prdName: "Apple iPad Pro 12.9",
        dataExp: "25.07.2026",
        dataCump: "25.07.2023",
        comp: "Istyle",
      },
      {
        prdName: "Razer Blade 15",
        dataExp: "30.08.2027",
        dataCump: "30.08.2024",
        comp: "Media Galaxy",
      },
      {
        prdName: "LG Gram 17",
        dataExp: "14.09.2026",
        dataCump: "14.09.2023",
        comp: "Flanco",
      },
      {
        prdName: "ASUS TUF Gaming A15",
        dataExp: "22.10.2027",
        dataCump: "22.10.2024",
        comp: "PC Garage",
      },
      {
        prdName: "MSI Stealth GS66",
        dataExp: "03.11.2026",
        dataCump: "03.11.2023",
        comp: "Altex",
      },{
        prdName: "Sony WH-1000XM5",
        dataExp: "10.12.2026",
        dataCump: "10.12.2023",
        comp: "QuickMobile",
      },
      {
        prdName: "Xiaomi Redmi Note 12 Pro",
        dataExp: "07.04.2027",
        dataCump: "07.04.2024",
        comp: "eMAG",
      },
      {
        prdName: "Logitech MX Master 3S",
        dataExp: "19.08.2025",
        dataCump: "19.08.2023",
        comp: "PC Garage",
      },
      {
        prdName: "Canon EOS R6 Mark II",
        dataExp: "25.05.2028",
        dataCump: "25.05.2025",
        comp: "Flanco",
      },
      {
        prdName: "Garmin Fenix 7X",
        dataExp: "30.11.2026",
        dataCump: "30.11.2023",
        comp: "Altex",
      },
      {
        prdName: "Huawei MateBook D16",
        dataExp: "14.09.2027",
        dataCump: "14.09.2024",
        comp: "Media Galaxy",
      },
      {
        prdName: "Philips Hue Starter Kit",
        dataExp: "02.03.2026",
        dataCump: "02.03.2023",
        comp: "Istyle",
      },
      {
        prdName: "SteelSeries Apex Pro TKL",
        dataExp: "22.10.2025",
        dataCump: "22.10.2023",
        comp: "Cel.ro",
      },
      {
        prdName: "JBL Charge 5",
        dataExp: "17.07.2027",
        dataCump: "17.07.2024",
        comp: "Evomag",
      },
      {
        prdName: "AMD Ryzen 9 7950X",
        dataExp: "09.01.2028",
        dataCump: "09.01.2025",
        comp: "PC Garage",
      },
    ],[]);
      // ... restul intrărilor ...
  
    const [sortOption, setSortOption] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSortOpen, setIsSortOpen] = useState(false);
  
    const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split(".");
      return new Date(`${year}-${month}-${day}`);
    };
  
    const filteredAndSortedWarranties = useMemo(() => {
      let result = [...originalWarranties];
      
      // Filtrare
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(warranty => 
          warranty.prdName.toLowerCase().includes(query) ||
          warranty.comp.toLowerCase().includes(query)
        );
      }
  
      // Sortare
      const today = new Date();
      switch (sortOption) {
        case "Expiration Date (Asc)":
          return result.sort((a, b) => 
            parseDate(a.dataExp).getTime() - parseDate(b.dataExp).getTime()
          );
        case "Expiration Date (Desc)":
          return result.sort((a, b) => 
            parseDate(b.dataExp).getTime() - parseDate(a.dataExp).getTime()
          );
        case "Upcoming Expiration (Asc)":
          return result.sort((a, b) => {
            const aDiff = parseDate(a.dataExp).getTime() - today.getTime();
            const bDiff = parseDate(b.dataExp).getTime() - today.getTime();
            return aDiff - bDiff;
          });
        case "Upcoming Expiration (Desc)":
          return result.sort((a, b) => {
            const aDiff = parseDate(a.dataExp).getTime() - today.getTime();
            const bDiff = parseDate(b.dataExp).getTime() - today.getTime();
            return bDiff - aDiff;
          });
        case "Name (A-Z)":
          return result.sort((a, b) => a.prdName.localeCompare(b.prdName));
        case "Name (Z-A)":
          return result.sort((a, b) => b.prdName.localeCompare(a.prdName));
        default:
          return result;
      }
    }, [originalWarranties, searchQuery, sortOption]);
  
    const handleSortSelection = (option: string) => {
      setSortOption(option);
      setIsSortOpen(false);
    };
  
    const toggleSortDropdown = () => setIsSortOpen(!isSortOpen);
    const sortOptions = [
      "Expiration Date (Asc)",
      "Expiration Date (Desc)",
      "Upcoming Expiration (Asc)",
      "Upcoming Expiration (Desc)",
      "Name (A-Z)",
      "Name (Z-A)"
    ];

    return (
      <div className="dashboard-page">
        {!isLoggedIn && <LoginLightbox />}
        <DashboardHero activeCount={filteredAndSortedWarranties.length} />
        <GridContainer />
        <DashboardTools
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOptions={sortOptions}
          selectedSort={sortOption}
          isSortOpen={isSortOpen}
          onToggleSort={toggleSortDropdown}
          onSelectSort={handleSortSelection}
        />
        <DashboardTable warranties={filteredAndSortedWarranties} />
      </div>
    );
  };

  export default Dashboard;
