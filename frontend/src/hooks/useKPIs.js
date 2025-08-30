import { useState, useEffect } from 'react';

export const useKPIs = () => {
  const [kpiData, setKpiData] = useState({
    todayAppointments: 0,
    unreadMessages: 0,
    activeProjects: 0,
    monthlyRevenue: 0,
    loading: true,
    error: null
  });

  const loadKPIData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }

      // Récupérer les RDV d'aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const appointmentsResponse = await fetch(`http://localhost:5000/api/events?date=${today}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Récupérer les messages non lus
      const messagesResponse = await fetch('http://localhost:5000/api/chat/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Récupérer les devis actifs (projets en cours)
      const quotesResponse = await fetch('http://localhost:5000/api/quotes?status=sent', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Récupérer les revenus du mois
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const revenueResponse = await fetch(`http://localhost:5000/api/quotes/revenue?month=${currentMonth}&year=${currentYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let todayAppointments = 0;
      let unreadMessages = 0;
      let activeProjects = 0;
      let monthlyRevenue = 0;

      // Traiter les réponses
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        todayAppointments = appointmentsData.events?.length || 0;
      }

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        unreadMessages = messagesData.unreadCount || 0;
      }

      if (quotesResponse.ok) {
        const quotesData = await quotesResponse.json();
        activeProjects = quotesData.quotes?.length || 0;
      }

      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        monthlyRevenue = revenueData.revenue || 0;
      } else {
        // Fallback: calculer depuis les devis acceptés
        const acceptedQuotesResponse = await fetch('http://localhost:5000/api/quotes?status=accepted', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (acceptedQuotesResponse.ok) {
          const acceptedQuotesData = await acceptedQuotesResponse.json();
          const currentMonthQuotes = acceptedQuotesData.quotes?.filter(quote => {
            const quoteDate = new Date(quote.createdAt);
            return quoteDate.getMonth() === currentMonth - 1 && quoteDate.getFullYear() === currentYear;
          }) || [];
          
          monthlyRevenue = currentMonthQuotes.reduce((sum, quote) => sum + (quote.totalAmount || 0), 0);
        }
      }

      setKpiData({
        todayAppointments,
        unreadMessages,
        activeProjects,
        monthlyRevenue,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Erreur lors du chargement des KPIs:', error);
      setKpiData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  useEffect(() => {
    loadKPIData();
    
    // Actualiser toutes les 5 minutes
    const interval = setInterval(loadKPIData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshKPIs = () => {
    setKpiData(prev => ({ ...prev, loading: true }));
    loadKPIData();
  };

  return {
    ...kpiData,
    refreshKPIs
  };
};
