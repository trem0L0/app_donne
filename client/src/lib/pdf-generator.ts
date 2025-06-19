import jsPDF from 'jspdf';
import type { Donation, Association } from '@shared/schema';
import { formatCurrency, formatDate } from './utils';

export interface ReceiptData {
  donation: Donation;
  association: Association;
  donorInfo: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    postalCode: string;
    city: string;
  };
}

export function generateTaxReceipt(data: ReceiptData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Colors
  const primaryColor = '#4F46E5'; // Blue
  const accentColor = '#F59E0B'; // Yellow
  const textColor = '#374151'; // Gray
  const lightGray = '#F3F4F6';
  
  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('REÇU FISCAL', 20, 16);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('DonVie - Plateforme de dons', pageWidth - 20, 16, { align: 'right' });
  
  // Association info section
  let yPos = 40;
  doc.setTextColor(textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ASSOCIATION BÉNÉFICIAIRE', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom: ${data.association.name}`, 20, yPos);
  
  yPos += 6;
  doc.text(`SIRET: ${data.association.siret}`, 20, yPos);
  
  yPos += 6;
  doc.text(`Adresse: ${data.association.address}`, 20, yPos);
  
  yPos += 6;
  doc.text(`Email: ${data.association.email}`, 20, yPos);
  
  yPos += 6;
  doc.text(`Téléphone: ${data.association.phone}`, 20, yPos);
  
  if (data.association.website) {
    yPos += 6;
    doc.text(`Site web: ${data.association.website}`, 20, yPos);
  }
  
  // Donor info section
  yPos += 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DONATEUR', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom: ${data.donorInfo.lastName}`, 20, yPos);
  
  yPos += 6;
  doc.text(`Prénom: ${data.donorInfo.firstName}`, 20, yPos);
  
  yPos += 6;
  doc.text(`Adresse: ${data.donorInfo.address}`, 20, yPos);
  
  yPos += 6;
  doc.text(`${data.donorInfo.postalCode} ${data.donorInfo.city}`, 20, yPos);
  
  yPos += 6;
  doc.text(`Email: ${data.donorInfo.email}`, 20, yPos);
  
  // Donation details section
  yPos += 20;
  doc.setFillColor(lightGray);
  doc.rect(15, yPos - 5, pageWidth - 30, 40, 'F');
  
  doc.setTextColor(textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAILS DU DON', 20, yPos + 5);
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date du don: ${data.donation.createdAt ? formatDate(data.donation.createdAt) : formatDate(new Date())}`, 20, yPos);
  
  yPos += 8;
  doc.text(`Numéro de transaction: ${data.donation.transactionId}`, 20, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor);
  doc.text(`Montant du don: ${formatCurrency(data.donation.amount)}`, 20, yPos);
  
  // Tax benefit calculation
  const donationAmount = parseFloat(data.donation.amount);
  const taxBenefit = Math.round(donationAmount * 0.66);
  const realCost = donationAmount - taxBenefit;
  
  yPos += 25;
  doc.setTextColor(textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AVANTAGE FISCAL', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Conformément à l\'article 200 du Code général des impôts:', 20, yPos);
  
  yPos += 8;
  doc.text(`• Montant déductible de vos impôts: ${formatCurrency(taxBenefit)} (66% du don)`, 20, yPos);
  
  yPos += 6;
  doc.text(`• Coût réel de votre don après déduction: ${formatCurrency(realCost)}`, 20, yPos);
  
  yPos += 6;
  doc.text('• Déduction limitée à 20% de votre revenu net imposable', 20, yPos);
  
  // Legal notice
  yPos += 20;
  doc.setFillColor(accentColor);
  doc.rect(15, yPos - 3, pageWidth - 30, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('MENTION LÉGALE OBLIGATOIRE', 20, yPos + 3);
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.text('Ce reçu vous permet de bénéficier d\'une réduction d\'impôt sur le revenu égale à 66% du', 20, yPos);
  
  yPos += 4;
  doc.text('montant de votre don, dans la limite de 20% de votre revenu imposable.', 20, yPos);
  
  yPos += 4;
  doc.text('Conservez précieusement ce document pour votre déclaration fiscale.', 20, yPos);
  
  // Footer
  yPos = pageHeight - 30;
  doc.setTextColor(textColor);
  doc.setFontSize(8);
  doc.text('Document généré automatiquement par DonVie', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  doc.text(`Généré le ${formatDate(new Date())}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setTextColor(primaryColor);
  doc.text('DonVie - Plateforme de dons sécurisée aux associations caritatives', pageWidth / 2, yPos, { align: 'center' });
  
  return doc;
}

export function downloadTaxReceipt(data: ReceiptData): void {
  const doc = generateTaxReceipt(data);
  const fileName = `recu-fiscal-${data.donation.transactionId}-${data.association.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
  doc.save(fileName);
}