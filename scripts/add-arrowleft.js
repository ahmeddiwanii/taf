const fs = require('fs');
const file = 'app/test/results/page.tsx';
let c = fs.readFileSync(file, 'utf8');
if (!c.includes('ArrowLeft,')) {
    c = c.replace('} from "lucide-react"', '  ArrowLeft,\n} from "lucide-react"');
    fs.writeFileSync(file, c);
}
