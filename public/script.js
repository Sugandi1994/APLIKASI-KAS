let data = [];

async function loadData() {
    const res = await fetch('/api/transaksi');
    data = await res.json();
    render();
}

function formatRupiah(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function render() {
    const tbody = document.getElementById('tabelData');
    tbody.innerHTML = '';
    let totalIn=0, totalOut=0;

    const month = document.getElementById('bulanFilter').value;
    let filtered = data;
    if (month) {
        filtered = data.filter(d => d.tanggal.startsWith(month));
    }

    filtered.forEach((d, i) => {
        if(d.jenis==='Pemasukan') totalIn+=Number(d.jumlah);
        else totalOut+=Number(d.jumlah);

        tbody.innerHTML += `
          <tr>
            <td>${i+1}</td>
            <td>${d.jenis}</td>
            <td>${formatRupiah(d.jumlah)}</td>
            <td>${d.keterangan}</td>
            <td>${d.tanggal}</td>
            <td>
              <button onclick="editData(${i})" class="btn btn-sm btn-warning">Edit</button>
              <button onclick="hapusData(${i})" class="btn btn-sm btn-danger">Hapus</button>
            </td>
          </tr>`;
    });

    // Update the new total display above the table
    const totalBulanDiv = document.getElementById('totalBulan');
    const bulanSelectedSpan = document.getElementById('bulanSelected');
    const totalPemasukanStrong = document.getElementById('totalPemasukan');
    const totalPengeluaranStrong = document.getElementById('totalPengeluaran');

    if (month) {
        bulanSelectedSpan.textContent = month;
        totalPemasukanStrong.textContent = formatRupiah(totalIn);
        totalPengeluaranStrong.textContent = formatRupiah(totalOut);
        totalBulanDiv.style.display = 'block';
    } else {
        totalBulanDiv.style.display = 'none';
    }

    document.getElementById('totalIn').textContent = formatRupiah(totalIn);
    document.getElementById('totalOut').textContent = formatRupiah(totalOut);
    document.getElementById('saldo').textContent = formatRupiah(totalIn - totalOut);
}

document.getElementById('formTransaksi').addEventListener('submit', async e=>{
    e.preventDefault();
    const jenis=document.getElementById('jenis').value;
    const jumlah=document.getElementById('jumlah').value;
    const keterangan=document.getElementById('keterangan').value;
    const tanggal = document.getElementById('tanggal').value;


    await fetch('/api/transaksi',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({jenis, jumlah, keterangan, tanggal})
    });
    e.target.reset();
    loadData();
});

async function editData(id){
    const password = prompt('Masukkan password:');
    const item = data[id];
    const newJumlah=prompt('Jumlah baru:', item.jumlah);
    const newKet=prompt('Keterangan baru:', item.keterangan);
    const newData={...item, jumlah:newJumlah, keterangan:newKet};

    await fetch('/api/transaksi/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({password,data:newData})
    });
    loadData();
}

async function hapusData(id){
    const password = prompt('Masukkan password:');
    await fetch('/api/transaksi/'+id,{method:'DELETE',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({password})
    });
    loadData();
}

document.getElementById('bulanFilter').addEventListener('change', render);

document.getElementById('exportXlsx').addEventListener('click', ()=>{
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'transaksi.xlsx');
});

document.getElementById('exportPdf').addEventListener('click', async ()=>{
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Create a temporary container to hold the totalBulan and table for export
    const exportContainer = document.createElement('div');
    const totalBulan = document.getElementById('totalBulan');
    const tableResponsive = document.querySelector('.table-responsive');

    // Clone the nodes to avoid modifying the original DOM
    const totalBulanClone = totalBulan.cloneNode(true);
    const tableClone = tableResponsive.cloneNode(true);

    // Append clones to the container
    exportContainer.appendChild(totalBulanClone);
    exportContainer.appendChild(tableClone);

    // Append container to body (hidden) so html2canvas can render it
    exportContainer.style.position = 'fixed';
    exportContainer.style.left = '-9999px';
    exportContainer.style.top = '0';
    document.body.appendChild(exportContainer);

    // Use html2canvas on the container
    const canvas = await html2canvas(exportContainer);
    const imgData = canvas.toDataURL('image/png');

    // Remove the container after rendering
    document.body.removeChild(exportContainer);

    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save('transaksi.pdf');
});
document.getElementById('tanggal').value = new Date().toISOString().slice(0,10);
loadData();


