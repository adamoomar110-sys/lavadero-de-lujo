import fitz
import sys

doc = fitz.open(sys.argv[1])
page = doc.load_page(0)
pix = page.get_pixmap(dpi=150)
pix.save(sys.argv[2])
print("Saved", sys.argv[2])
