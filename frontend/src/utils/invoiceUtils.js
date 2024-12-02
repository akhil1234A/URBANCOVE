import jsPDF from "jspdf";
import logoSvg from "../assets/logo.svg";
import { svg2pdf } from "svg2pdf.js";

export const generateInvoice = async (order) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    
    if (logoSvg) {
      const svgElement = document.createElement("div");
      svgElement.innerHTML = logoSvg; 
      const svg = svgElement.firstChild;

      if (svg instanceof SVGElement) {
        await svg2pdf(svg, doc, { x: 20, y: 10, width: 40, height: 40 });
      }
    }

    // Company details
    doc.setFont("helvetica", "normal"); 
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("UrbanCove", pageWidth - 20, 20, { align: "right" });
    doc.text("urban.cove@gmail.com", pageWidth - 20, 25, { align: "right" });
    doc.text("Room No.III/9, 3rd Floor, SDF Building,", pageWidth - 20, 30, { align: "right" });
    doc.text("Kinfra Techno Industrialpark", pageWidth - 20, 35, { align: "right" });
    doc.text("Calicut University PO, Kakkanchery,", pageWidth - 20, 40, { align: "right" });
    doc.text("Kerala 673635", pageWidth - 20, 45, { align: "right" });

    // Invoice title
    doc.setFontSize(22);
    doc.setTextColor(0);
    doc.text("INVOICE", 20, 70);

    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice Number: INV-${order._id.slice(-6)}`, 20, 80);
    doc.text(`Date: ${new Date(order.placedAt).toLocaleDateString()}`, 20, 85);
    doc.text(`Order ID: ${order._id}`, 20, 90);

    // Customer details
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Bill To:", 20, 105);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${order.user.name}`, 20, 112);
    doc.text(`${order.user.email}`, 20, 117);
    doc.text(`${order.deliveryAddress.street}`, 20, 122);
    doc.text(`${order.deliveryAddress.city}, ${order.deliveryAddress.state}`, 20, 127);
    doc.text(`${order.deliveryAddress.postcode}, ${order.deliveryAddress.country}`, 20, 132);
    doc.text(`Phone: ${order.deliveryAddress.phoneNumber}`, 20, 137);

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 150, pageWidth - 40, 10, "F");
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text("Item", 25, 157);
    doc.text("Quantity", 100, 157, { align: "center" });
    doc.text("Price", 140, 157, { align: "center" });
    doc.text("Total", 180, 157, { align: "right" });

    // Table content
    let yPos = 170;
    order.items.forEach((item) => {
      doc.setTextColor(100);
      doc.text(item.productId.productName, 25, yPos);
      doc.text(item.quantity.toLocaleString(), 100, yPos, { align: "center" });
      doc.setFontSize(10); // Reset font size to avoid superscript
      doc.text(item.price.toFixed(2), 140, yPos, { align: "center" });
      doc.text((item.price * item.quantity).toFixed(2), 180, yPos, { align: "right" });
      yPos += 10;
    });

    // Totals
    yPos += 10;
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;
    doc.setTextColor(0);
    doc.text("Subtotal:", 140, yPos);
    doc.setFontSize(10); 
    doc.text(order.totalAmount.toFixed(2), 180, yPos, { align: "right" });
    yPos += 10;
    doc.text("Discount:", 140, yPos);
    doc.setFontSize(10); 
    doc.text(order.discountAmount.toFixed(2), 180, yPos, { align: "right" });
    yPos += 10;
    doc.setFontSize(12);
    doc.text("Total:", 140, yPos);
    doc.text(`Rs. ${(order.totalAmount - order.discountAmount).toFixed(2)}`, 180, yPos, { align: "right" });

    // Payment details
    yPos += 20;
    doc.setFontSize(10);
    doc.text(`Payment Method: ${order.paymentMethod}`, 20, yPos);
    doc.text(`Payment Status: ${order.paymentStatus}`, 20, yPos + 5);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Thank you for shopping with UrbanCove!", pageWidth / 2, 280, { align: "center" });

    return doc;
  } catch (error) {
    console.error("Error generating invoice:", error.message, error.stack);
    throw new Error("Failed to generate invoice.");
  }
};
