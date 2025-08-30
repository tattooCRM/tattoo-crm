const puppeteer = require('puppeteer');
const path = require('path');

const generateQuotePDF = async (quote) => {
  let browser;
  try {
    console.log('🔄 Début génération PDF pour devis:', quote.quoteNumber);
    
    // Vérifier si Puppeteer est disponible
    let puppeteer;
    try {
      puppeteer = require('puppeteer');
      console.log('✅ Puppeteer chargé avec succès');
    } catch (error) {
      console.error('❌ Erreur chargement Puppeteer:', error.message);
      throw new Error('Puppeteer non disponible. PDF non généré.');
    }

    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    console.log('✅ Browser Puppeteer lancé');
    
    const page = await browser.newPage();

    // Template HTML pour le devis
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devis ${quote.quoteNumber || 'N/A'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background: #f7fafc;
            padding: 40px 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px;
        }
        
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            gap: 40px;
        }
        
        .info-box {
            flex: 1;
        }
        
        .info-box h3 {
            font-size: 14px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
            font-weight: 600;
        }
        
        .info-box p {
            font-size: 16px;
            margin-bottom: 4px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .items-table th {
            background: #f7fafc;
            padding: 16px;
            text-align: left;
            font-weight: 600;
            color: #4a5568;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .items-table td {
            padding: 16px;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .items-table tr:last-child td {
            border-bottom: none;
        }
        
        .total-section {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
            margin-bottom: 32px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            width: 300px;
            padding: 8px 0;
            font-size: 16px;
        }
        
        .total-row.final {
            border-top: 2px solid #e2e8f0;
            font-weight: 700;
            font-size: 20px;
            color: #2d3748;
            padding-top: 16px;
            margin-top: 8px;
        }
        
        .notes {
            background: #fefefe;
            border: 1px solid #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 24px;
            font-size: 14px;
            color: #4a5568;
        }
        
        .notes h4 {
            color: #2d3748;
            margin-bottom: 8px;
        }
        
        .terms {
            background: #fefefe;
            border: 1px solid #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            font-size: 14px;
            color: #718096;
        }
        
        .terms h4 {
            color: #4a5568;
            margin-bottom: 12px;
        }
        
        .validity {
            text-align: center;
            background: #fff5d6;
            color: #975a16;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
        }
        
        .footer {
            text-align: center;
            color: #718096;
            font-size: 12px;
            padding: 20px;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DEVIS ${quote.quoteNumber || 'N/A'}</h1>
            <p>${quote.title || 'Devis de tatouage'}</p>
        </div>
        
        <div class="content">
            <div class="info-section">
                <div class="info-box">
                    <h3>Tatoueur</h3>
                    <p><strong>${quote.artistInfo?.name || 'Studio de tatouage'}</strong></p>
                    ${quote.artistInfo?.email ? `<p>${quote.artistInfo.email}</p>` : ''}
                    ${quote.artistInfo?.phone ? `<p>${quote.artistInfo.phone}</p>` : ''}
                    ${quote.artistInfo?.address ? `<p>${quote.artistInfo.address}</p>` : ''}
                </div>
                
                <div class="info-box">
                    <h3>Client</h3>
                    <p><strong>${quote.clientInfo?.name || 'Client'}</strong></p>
                    ${quote.clientInfo?.email ? `<p>${quote.clientInfo.email}</p>` : ''}
                    ${quote.clientInfo?.phone ? `<p>${quote.clientInfo.phone}</p>` : ''}
                </div>
                
                <div class="info-box">
                    <h3>Informations</h3>
                    <p>Date: ${new Date(quote.createdAt).toLocaleDateString('fr-FR')}</p>
                    <p>Devis N°: ${quote.quoteNumber || 'N/A'}</p>
                    ${quote.validUntil ? `<p>Valable jusqu'au: ${new Date(quote.validUntil).toLocaleDateString('fr-FR')}</p>` : ''}
                </div>
            </div>
            
            ${quote.items && quote.items.length > 0 ? `
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="width: 80px;">Qté</th>
                        <th style="width: 120px; text-align: right;">Prix unitaire</th>
                        <th style="width: 120px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${quote.items.map(item => `
                        <tr>
                            <td>
                                <strong>${item.description || 'Service'}</strong>
                                ${item.details ? `<br><small style="color: #718096;">${item.details}</small>` : ''}
                            </td>
                            <td>${item.quantity || 1}</td>
                            <td style="text-align: right;">${(item.unitPrice || 0).toFixed(2)} €</td>
                            <td style="text-align: right;"><strong>${((item.quantity || 1) * (item.unitPrice || 0)).toFixed(2)} €</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : ''}
            
            <div class="total-section">
                <div class="total-row">
                    <span>Sous-total</span>
                    <span>${(quote.subtotal || 0).toFixed(2)} €</span>
                </div>
                ${(quote.taxAmount || 0) > 0 ? `
                <div class="total-row">
                    <span>TVA (${(quote.taxRate || 0)}%)</span>
                    <span>${(quote.taxAmount || 0).toFixed(2)} €</span>
                </div>
                ` : ''}
                <div class="total-row final">
                    <span>Total</span>
                    <span>${(quote.totalAmount || 0).toFixed(2)} €</span>
                </div>
            </div>
            
            ${quote.notes ? `
            <div class="notes">
                <h4>Notes</h4>
                <p>${quote.notes}</p>
            </div>
            ` : ''}
            
            ${quote.validUntil ? `
            <div class="validity">
                Ce devis est valable jusqu'au ${new Date(quote.validUntil).toLocaleDateString('fr-FR')}
            </div>
            ` : ''}
            
            <div class="terms">
                <h4>Conditions générales</h4>
                <p>${quote.terms || 'Conditions générales de vente applicables. Un acompte de 30% est demandé à la réservation. Le solde est à régler le jour du rendez-vous. Les prix sont exprimés TTC.'}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Devis généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
    </div>
</body>
</html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    console.log('✅ HTML contenu défini dans la page');
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    console.log('✅ PDF généré avec succès, taille:', pdfBuffer.length, 'bytes');
    return pdfBuffer;
  } catch (error) {
    console.error('❌ Erreur génération PDF:', error);
    
    // Fallback: retourner une erreur explicite au lieu d'un crash
    if (error.message.includes('Puppeteer')) {
      throw new Error('Service PDF temporairement indisponible. Veuillez réessayer plus tard.');
    }
    
    throw new Error(`Erreur génération PDF: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser Puppeteer fermé');
    }
  }
};

module.exports = {
  generateQuotePDF
};
