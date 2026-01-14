if(typeof QRCode==='undefined'){let s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';document.head.appendChild(s)}
if(typeof jQuery!=='undefined'){
let l=document.createElement('link');
l.rel='stylesheet';
l.href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/all.min.css';
document.head.appendChild(l);
}
function isMobileDevice(){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}
function parseQrisMerchantName(q){const t='59';const i=q.indexOf(t);if(i===-1)return null;const l=i+t.length;const n=q.substring(l,l+2);const a=parseInt(n,10);if(isNaN(a))return null;const s=l+2;return q.substring(s,s+a)}
function generateQrisPayload(o,a){function c(d){let c=0xFFFF;for(let b=0;b<d.length;b++){c^=d.charCodeAt(b)<<8;for(let e=0;e<8;e++)c=(c&0x8000)?(c<<1)^0x1021:c<<1}
return('0000'+(c&0xFFFF).toString(16).toUpperCase()).slice(-4)}
const t='5802ID';const i=o.indexOf(t);if(i===-1)throw new Error("Format qrisString tidak valid.");const p=o.substring(0,i);const s=o.substring(i);const m=a.toString();const l=m.length.toString().padStart(2,'0');const n=`54${l}${m}`;const r=`${p}${n}${s}6304`;const u=c(r);return `${p}${n}${s}6304${u}`}
jQuery(document).ready(function($){if($('.qris-cepat-wrapper-v11').length>0){return}
let qT=null;let bC=null;let pIR=null;let accountData=null;function compressImage(file,maxSizeInMB=1){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.readAsDataURL(file);reader.onload=(event)=>{const img=new Image();img.src=event.target.result;img.onload=()=>{const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');const MAX_WIDTH=1920;const MAX_HEIGHT=1080;let width=img.width;let height=img.height;if(width>height){if(width>MAX_WIDTH){height*=MAX_WIDTH/width;width=MAX_WIDTH}}else{if(height>MAX_HEIGHT){width*=MAX_HEIGHT/height;height=MAX_HEIGHT}}
canvas.width=width;canvas.height=height;ctx.drawImage(img,0,0,width,height);canvas.toBlob((blob)=>{if(blob.size<file.size){resolve(blob)}else{resolve(file)}},'image/jpeg',0.7)};img.onerror=(error)=>reject(error)};reader.onerror=(error)=>reject(error)})}
const cS=`
body{margin:0}.qris-cepat-wrapper-v11,.qris-cepat-wrapper-v11 *{box-sizing:border-box}.qris-cepat-wrapper-v11{margin:0}.qris-cepat-wrapper-v11 .cepat-form-container{display:none;background-color:#ffffff;border-radius:14px;box-shadow:0 3px 16px rgba(0, 0, 0, 0.08);border:1px solid #e6e6e6;transition:all 0.3s ease;padding:20px}.qris-cepat-wrapper-v11 .depo-tabs{display:flex;gap:8px;margin-bottom:14px;background-color:#000000;padding:6px 6px;border-radius:10px;border:1px solid #e6e6e6;position:relative}.qris-cepat-wrapper-v11 .tab{flex:1;padding:8px 8px;cursor:pointer;color:#fff;font-weight:600;text-align:center;border-radius:8px;transition:all .3s ease;display:flex;align-items:center;justify-content:center;gap:4px;font-size:.8rem;border:none;background-color:#2d3436;position:relative;overflow:visible;transition:all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)}.qris-cepat-wrapper-v11 .tab.active{background-color:#00a2b1;color:#fff;box-shadow:0 3px 8px rgba(0, 162, 177, 0.3);transform: translateY(-1px)}.qris-cepat-wrapper-v11 .tab[data-target="qris2"].active{background-color:#00a2b1;box-shadow:0 3px 8px rgba(0, 162, 177, 0.3);transform: translateY(-1px)}.qris-cepat-wrapper-v11 .tab img{height:14px;filter:invert(1)}.qris-cepat-wrapper-v11 .tab[data-target="qris"]::after{content:'CEPAT';position:absolute;top:-6px;right:-5px;background:linear-gradient(135deg, #ff0000, #ff6666);color:#fff;padding:2px 6px;font-size:.5rem;font-weight:700;border-radius:15px;box-shadow:0 1px 4px rgba(255, 0, 0, 0.4);z-index:2;text-transform:uppercase;letter-spacing:0.3px;font-weight:700;animation:pulse 1.5s infinite ease-in-out}.qris-cepat-wrapper-v11 .tab[data-target="qris2"]::after{content:'MANUAL';position:absolute;top:-6px;right:-5px;background:linear-gradient(135deg, #ff0000, #ff6666);color:#fff;padding:2px 6px;font-size:.5rem;font-weight:700;border-radius:15px;box-shadow:0 1px 4px rgba(255, 0, 0, 0.4);z-index:2;text-transform:uppercase;letter-spacing:0.3px;font-weight:700;animation:pulse 1.5s infinite ease-in-out}.qris-cepat-wrapper-v11 .form-group{margin-bottom:10px;opacity:1;transition:opacity 0.3s ease}.qris-cepat-wrapper-v11 label{display:block;font-weight:600;margin-bottom:.3rem;color:#555;text-transform:none;font-size:.85rem;transition:color 0.3s ease}.qris2-form-container .form-group{margin-bottom:8px}.qris-cepat-wrapper-v11 .form-control{height:38px!important;width:100%;padding:.5rem 1rem;font-size:.85rem;color:#333;background-color:#fff;border:1px solid #ddd;border-radius:10px;transition:all .3s ease;box-shadow:0 2px 4px rgba(0,0,0,0.02)}.qris-cepat-wrapper-v11 .form-control::placeholder{color:#aaa;opacity:0.8}.form-control:disabled{background-color:#f8f8f8;opacity:.8}.form-control.is-invalid{border-color:#d9534f!important;animation:shake .6s;box-shadow:0 0 0 3px rgba(217, 83, 79, 0.2)}.qris-validation-message{align-items:center;gap:8px;padding:10px 12px;background-color:#fff5f5;border:1px solid #ffd6d6;border-radius:8px;color:#c62828;font-size:.8rem;font-weight:500;margin-top:8px;display:none;box-shadow:0 2px 8px rgba(0,0,0,0.05);transition:all 0.3s ease}.qris-validation-message::before{font-family:"Font Awesome 6 Free";content:"\\f06a";font-weight:900;display:inline-block;margin-right:8px}.payment-method-box{background-color:#f8f9fa;border-radius:14px;padding:22px 16px;text-align:center;margin-bottom:22px;box-shadow:0 2px 10px rgba(0, 0, 0, 0.05);transition:all 0.3s ease}.payment-method-box img,.payment-method-box svg{display:inline-block;margin:0 auto;max-height:65px;width:auto;max-width:170px;opacity:.9;transition:all .3s ease}.payment-method-box svg{fill:#00a2b1}.payment-method-box:hover img,.payment-method-box:hover svg{opacity:1;transform:scale(1.05)}.quick-amount-selector{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:7px;padding-bottom:7px;scrollbar-width:thin;scrollbar-color:#00a2b1 #e0e0e0;margin:7px 0}.quick-amount-btn{flex-shrink:0;padding:6px 12px;background-color:#f5f5f5;border:2px solid #eee;color:#666;border-radius:10px;cursor:pointer;transition:all .3s ease;text-align:center;font-weight:600;font-size:.75rem;box-shadow:0 2px 6px rgba(0,0,0,0.05);position:relative;overflow:hidden}.quick-amount-btn::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(0,162,177,0.2),transparent);transition:all 0.5s}.quick-amount-btn:hover::before{left:100%}.quick-amount-btn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.1)}.quick-amount-btn.active{border-color:#00a2b1;background-color:#fff;color:#00a2b1;box-shadow:0 0 0 3px rgba(0, 162, 177, 0.25);transform:scale(1.05)}.input-group-promo{display:flex;align-items:stretch;position:relative;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-radius:10px;overflow:hidden}.input-group-promo .input-group-text,.input-group-promo .form-control,.input-group-promo .clear-input-btn{height:38px!important}.input-group-promo .input-group-text{display:flex;align-items:center;padding:.5rem .9rem;font-weight:600;color:#666;background-color:#f8f9fa;border:1px solid #ddd;border-radius:10px 0 0 10px;border-right:0}.input-group-promo .form-control{border-radius:0 10px 10px 0!important;flex:1 1 auto;width:1%;min-width:0;position:static;top:-9px;background-color:#fff}.clear-input-btn{position:absolute;right:8px;top:0;font-size:1.2rem;color:#999;cursor:pointer;display:none;line-height:38px;padding:0 4px}.clear-input-btn:hover{color:#00a2b1}.selected-promo-info{color:#333;background-color:#f8f9fa;padding:8px 12px;border-radius:8px;margin-top:8px;font-size:.8rem;font-weight:500;display:none;line-height:1.6;border-left:4px solid #00a2b1;transition:all 0.3s ease}.unique-code-info{display:none;margin-top:8px;padding:10px 12px;background-color:#f9f9f9;border-radius:8px;font-size:.85rem;color:#666;box-shadow:0 2px 6px rgba(0,0,0,0.03);border-left:3px solid #00a2b1}.unique-code-info strong[style*="#d9534f"]{color:#e53935!important}.unique-code-info strong[style*="#00a2b1"]{color:#00a2b1!important}.qris2-form-container .qris2-button{background-color:#00a2b1;width:100%;margin:0;display:block;box-shadow:0 3px 10px rgba(0, 162, 177, 0.3)}.qris2-form-container .qris2-button:hover{background-color:#008fa1;transform: translateY(-1px); box-shadow: 0 5px 14px rgba(0, 162, 177, 0.4)}.cepat-button{width:100%;padding:8px;border:none;border-radius:10px;color:#fff;font-size:.9rem;font-weight:700;cursor:pointer;margin-top:10px;background-color:#00a2b1;transition:all .3s ease;display:flex;align-items:center;justify-content:center;gap:5px;box-shadow:0 3px 10px rgba(0, 162, 177, 0.3);position:relative;overflow:hidden}.cepat-button::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);transition:all 0.5s}.cepat-button:hover::before{left:100%}.cepat-button:hover{transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 162, 177, 0.4);}.qris2-form-container .qris-validation-message{margin-top:5px}.result-container,.expired-container,.success-container{display:flex;flex-direction:column;align-items:center;text-align:center;padding:18px;animation:fadeIn 0.5s ease}.barcode-display{margin:4px auto;width:100%;max-width:250px;display:block}.barcode-display canvas,.barcode-display img{max-width:250px!important;height:auto!important;margin:0 auto 5px;display:block;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);transition:all 0.3s ease}#qris2-barcode-container{margin-bottom:15px;min-height:200px;min-width:250px;display:block;margin:0 auto 10px auto;text-align:center}.final-amount{font-size:1.6rem;color:#00a2b1;font-weight:700;display:block;margin:2px 0;transition:all 0.3s ease}.timer-container,.merchant-info{font-size:.9rem;color:#666;margin-bottom:10px}.merchant-info{display:flex!important;align-items:center;justify-content:center;gap:6px;font-size:.85rem;color:#666}.payment-timer{font-weight:700;color:#00a2b1}.expired-container{padding:28px 18px;background-color:#fff5f5;border:2px solid #ffd6d6;border-radius:12px;color:#333;box-shadow:0 4px 16px rgba(217, 83, 79, 0.15)}.buat-ulang-btn,.download-btn{background-color:#00a2b1;color:#fff;padding:10px 16px;border:none;border-radius:8px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:7px;margin-top:8px;transition:all .3s ease, transform .2s ease;box-shadow:0 2px 8px rgba(0, 162, 177, 0.3)}.buat-ulang-btn:hover,.download-btn:hover{background-color:#008fa1;transform: translateY(-1px);box-shadow: 0 4px 12px rgba(0, 162, 177, 0.4)}.success-container{padding:28px 0;background-color:#f0fff4;border-radius:16px;opacity:0;transition:opacity .5s ease;margin-top:18px;color:#333;box-shadow:0 4px 16px rgba(40, 167, 69, 0.15)}.success-container.visible{opacity:1}.success-container p{color:#666;margin-top:8px}.svg-checkmark{width:60px;height:60px;border-radius:50%;display:block;stroke-width:3;stroke:#28a745;stroke-miterlimit:10;margin:0 auto 15px auto;box-shadow:inset 0 0 0 #28a45;animation:fill .4s ease-in-out .4s forwards,scale .3s ease-in-out .9s both}.svg-checkmark__circle{stroke-dasharray:166;stroke-dashoffset:166;stroke-width:3;stroke-miterlimit:10;stroke:#28a745;fill:none;animation:stroke .6s cubic-bezier(.65,0,.45,1) forwards}.svg-checkmark__check{transform-origin:50% 50%;stroke-dasharray:48;stroke-dashoffset:48;stroke:#fff;animation:stroke .3s cubic-bezier(.65,0,.45,1) .8s forwards}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideIn{from{transform:translateY(-50px)}to{transform:translateY(0)}}@keyframes blinkPromo{from{opacity:1;transform:scale(1)}to{opacity:.6;transform:scale(.9)}}@keyframes blink-animation{0%,100%{transform:scale(1);opacity:1}30%{transform:scale(.9);opacity:.6}60%{transform:scale(1.15);opacity:1}}@keyframes stroke{100%{stroke-dashoffset:0}}@keyframes scale{0%,100%{transform:none}50%{transform:scale3d(1.1,1.1,1)}}@keyframes fill{100%{box-shadow:inset 0 0 0 40px #28a745}}@keyframes shake{10%,90%{transform:translate3d(-1px,0,0)}20%,80%{transform:translate3d(2px,0,0)}30%,50%,70%{transform:translate3d(-4px,0,0)}40%,60%{transform:translate3d(4px,0,0)}}@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:0.9}}@keyframes float{0%{transform:translateY(0px)}50%{transform:translateY(-8px)}100%{transform:translateY(0px)}}@keyframes gradient{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}@media (max-width:768px){.qris-cepat-wrapper-v11{margin:0}.qris-cepat-wrapper-v11 .cepat-form-container{padding:14px}.qris-cepat-wrapper-v11 .tab{font-size:.9rem;padding:8px 8px;gap:4px}.payment-method-box{padding:14px}.qris-cepat-wrapper-v11 label{font-size:.8rem;margin-bottom:.45rem}.qris-cepat-wrapper-v11 .form-control{height:40px!important;font-size:.85rem}.input-group-promo .input-group-text,.input-group-promo .clear-input-btn{height:40px!important}.quick-amount-btn{padding:7px 12px;font-size:.75rem}.cepat-button{padding:11px;font-size:.9rem;margin-top:18px}.final-amount{font-size:1.8rem}.expired-container,.success-container{padding:26px 16px}.expired-container h3,.success-container h3{font-size:1.1rem}.success-container p{font-size:.85rem}.svg-checkmark{width:55px;height:55px}.qris-form-container .input-group-promo .form-control,.qris2-form-container .input-group-promo .form-control{position:relative;top:-9.5px}}
`;
$('head').append(`<style>${cS}</style>`);const quickAmountButtonsHTML=`<button type="button" class="quick-amount-btn" data-amount="25000">25rb</button><button type="button" class="quick-amount-btn" data-amount="50000">50rb</button><button type="button" class="quick-amount-btn" data-amount="75000">75rb</button><button type="button" class="quick-amount-btn" data-amount="100000">100rb</button><button type="button" class="quick-amount-btn" data-amount="200000">200rb</button><button type="button" class="quick-amount-btn" data-amount="250000">250rb</button><button type="button" class="quick-amount-btn" data-amount="500000">500rb</button><button type="button" class="quick-amount-btn" data-amount="1000000">1jt</button><button type="button" class="quick-amount-btn" data-amount="2000000">2jt</button><button type="button" class="quick-amount-btn" data-amount="3000000">3jt</button><button type="button" class="quick-amount-btn" data-amount="4000000">4jt</button><button type="button" class="quick-amount-btn" data-amount="5000000">5jt</button><button type="button" class="quick-amount-btn" data-amount="6000000">6jt</button><button type="button" class="quick-amount-btn" data-amount="7000000">7jt</button><button type="button" class="quick-amount-btn" data-amount="8000000">8jt</button><button type="button" class="quick-amount-btn" data-amount="9000000">9jt</button><button type="button" class="quick-amount-btn" data-amount="10000000">10jt</button>`;const hM=`
<div class="qris-cepat-wrapper-v11"><div class="depo-tabs"><button type="button" class="tab" data-target="manual"><i class="fa-solid fa-keyboard"></i> Manual</button><button type="button" class="tab" data-target="qris"><i class="fa-solid fa-qrcode"></i> QRIS</button><button type="button" class="tab" data-target="qris2"><i class="fa-solid fa-credit-card"></i> QRIS 2</button></div><div class="cepat-form-container qris-form-container"><div class="cepat-input-area"><div class="qris-logo-container"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/QRIS_logo.svg/500px-QRIS_logo.svg.png" alt="QRIS Logo" class="qris-logo"></div><div class="form-group"><label>Pilih Nominal Cepat</label><div class="quick-amount-selector">${quickAmountButtonsHTML}</div></div><div class="form-group"><label for="qris-amount">Atau, Masukkan Jumlah Lain</label><div class="input-group-promo"><span class="input-group-text">Rp</span><input type="text" id="qris-amount" class="form-control" data-type="qris" placeholder="Contoh: 50.000"><span class="clear-input-btn">&times;</span></div><div class="unique-code-info"></div><div class="qris-validation-message"></div></div><div class="form-group promo-dropdown-container"><label for="promo-select">Promosi</label><select id="promo-select" class="form-control"><option value="">Memuat promosi...</option></select><div class="selected-promo-info"></div></div><button type="button" class="cepat-button qris-button"><span class="btn-text"><i class="fa-solid fa-qrcode"></i> Buat QRIS</span></button></div><div class="result-container"></div></div><div class="cepat-form-container qris2-form-container"><div class="cepat-input-area"><div class="form-group"><div id="qris2-barcode-container"><i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Memuat barcode... </div></div><div class="form-group"><label for="qris2-amount">Nominal Yang Ditransfer</label><div class="input-group-promo"><span class="input-group-text">Rp</span><input type="text" id="qris2-amount" class="form-control" placeholder="Contoh: 50.000"></div><div class="qris-validation-message"></div></div><div class="form-group"><label for="qris2-proof">Upload Bukti Transfer (Wajib)</label><input type="file" id="qris2-proof" class="form-control" accept="image/png, image/jpeg, image/jpg" name="receipt"><div class="qris-validation-message"></div></div><button type="button" class="cepat-button qris2-button"><span class="btn-text"><i class="fa-solid fa-paper-plane"></i> Konfirmasi Pembayaran</span></button></div><div class="result-container"></div></div></div>
`;
const dF=$('form[action="/ajax/cm/reqDeposit"]');
async function loadPromotions(formContext){const promoSelect=formContext.find('#promo-select');const promoContainer=formContext.find('.promo-dropdown-container');promoContainer.show();try{const dcr=await fetch('https://qrisgrd.jasjusweb.workers.dev/api/deposit-config');if(!dcr.ok){throw new Error('Gagal mengambil konfigurasi deposit.')}
const dc=await dcr.json();
if(!dc.success){
    promoSelect.empty();
    promoSelect.prop('disabled',true);
    promoSelect.append(`<option value="">${dc.message || "Sistem pembayaran dalam pemeliharaan."}</option>`);
    console.error('Error loading promotions:', dc.message || "Sistem pembayaran dalam pemeliharaan.");
    return;
}
// Set unique code length from config
window.qrisUniqueCodeLength = dc.uniqueCodeLength || 2;

const bankId=dc.bankId;$.ajax({url:'/ajax/credit/getDepositPromotion',type:'GET',dataType:'json',data:{bankId:bankId},success:function(response){promoSelect.empty();if(response&&response[0]==='success'&&response[1].length>0){promoSelect.prop('disabled',false);promoSelect.append('<option value="">-- Pilih Promosi --</option>');response[1].forEach(p=>{const promoId=p[0];const promoName=p[1];const optionHtml=`<option value="${promoId}">${promoName}</option>`;promoSelect.append(optionHtml)})}else{promoSelect.prop('disabled',true);promoSelect.append('<option value="">Tidak ada promosi yang tersedia</option>')}},error:function(){promoSelect.empty();promoSelect.prop('disabled',true);promoSelect.append('<option value="">Gagal memuat promosi</option>')}});}catch(error){promoSelect.empty();promoSelect.prop('disabled',true);promoSelect.append('<option value="">Gagal mengambil konfigurasi</option>');console.error('Error loading promotions:',error);}}
dF.each(async function(){const cF=$(this);if(cF.find('.qris-cepat-wrapper-v11').length===0){const mFC=cF.children().wrapAll('<div class="manual-form-container-v11"></div>').parent();cF.prepend(hM);mFC.show();cF.find('.tab[data-target=manual]').addClass('active');await loadPromotions(cF)}});
async function testDepositStatus() {
    try {
        // Ambil tanggal hari ini untuk pencarian
        const today = new Date();
        const formattedDate = `${today.getDate().toString().padStart(2,'0')}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getFullYear()} 00:00`;
        // Format tanggal akhir dengan waktu saat ini untuk mendapatkan data terbaru
        const hours = today.getHours().toString().padStart(2,'0');
        const minutes = today.getMinutes().toString().padStart(2,'0');
        const formattedEndDate = `${today.getDate().toString().padStart(2,'0')}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getFullYear()} ${hours}:${minutes}`;

        // Kirim permintaan untuk mendapatkan riwayat transaksi
        const historyResponse = await $.get(`/ajax/trans/getHistoryTransaction?searchDateFrom=${encodeURIComponent(formattedDate)}&searchDateTo=${encodeURIComponent(formattedEndDate)}`);

        if (historyResponse && historyResponse.code === '200' && historyResponse.data) {
            // Cari deposit dengan status pending
            const pendingDeposits = historyResponse.data.filter(item =>
                item.transType === 'Deposit' &&
                (item.status === 'Pending' || item.statusInt === 10)
            );

            if (pendingDeposits.length > 0) {
                return { status: 'pending', message: 'Masih ada deposit yang sedang diproses' };
            }
        }

        // Jika tidak ada deposit pending, kembalikan status no_pending_deposit
        return { status: 'no_pending_deposit' };
    } catch (error) {
        // Jika terjadi error jaringan, coba metode alternatif
        try {
            // Kirim permintaan deposit kosong untuk mengecek status
            const testResponse = await $.post('/ajax/cm/reqDeposit', {
                bankId: '',
                amount: 0,
                telcoRemark: 'status_check',
                promotionId: ''
            });

            // Jika respons menunjukkan error karena pending deposit
            if (testResponse && Array.isArray(testResponse) && testResponse[0] === 'error.ex') {
                if (testResponse[1] && testResponse[1].includes('pending deposit')) {
                    return { status: 'pending', message: testResponse[1] };
                }
            }

            // Jika tidak ada error, berarti tidak ada pending deposit
            return { status: 'no_pending_deposit' };
        } catch (secondaryError) {
            // Jika semua metode gagal, asumsikan tidak ada pending deposit
            return { status: 'no_pending_deposit' };
        }
    }
}

const sDS=(w,dA)=>{if(bC)clearInterval(bC);if(qT)clearInterval(qT);$.post('/ajax/cma2/allGamqris2Refresh');$.get('/ajax/account/getAccountDto',function(r){if(r&&typeof r[2]==='number'){$('.g8-bal-total').text('IDR '+r[2].toLocaleString('id-ID'))}});let aFS=0;const aQD=sessionStorage.getItem('activeQrData');const aDD=sessionStorage.getItem('activeDanaData');if(aQD){aFS=JSON.parse(aQD).amount}else if(aDD){aFS=JSON.parse(aDD).amount}
sessionStorage.removeItem('activeQrData');sessionStorage.removeItem('activeDanaData');const rC=w.find('.result-container');const fA=aFS.toLocaleString('id-ID');

testDepositStatus().then(status => {
    let additionalContent = '';

    if (status.status === 'no_pending_deposit') {
        additionalContent = '<button type="button" class="new-deposit-btn">Buat Deposit Baru</button>';
    } else {
        additionalContent = `
            <p>Anda masih memiliki deposit yang sedang diproses.</p>
            <p>Silakan tunggu hingga deposit sebelumnya selesai diproses.</p>
        `;
    }

    const sH=`<div class="success-container"><svg class="svg-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="svg-checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="svg-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg><h3>Deposit Berhasil!</h3><p>Saldo sebesar <strong>Rp ${fA}</strong> telah ditambahkan ke akun anda.</p>${additionalContent}</div>`;
    rC.html(sH).show();
    w.find('.cepat-input-area').hide();

    setTimeout(()=>{const sC=rC.find('.success-container');if(sC.length){sC.addClass('visible')}},10);

    if (status.status === 'no_pending_deposit') {
        $('.new-deposit-btn').on('click', function() {
            resetDepositForm(w);
        });
    }
});};

const sBC=(iB,w)=>{if(bC)clearInterval(bC);bC=setInterval(()=>{$.get('/ajax/account/getAccountDto',function(r){if(r&&typeof r[2]==='number'){const cB=r[2];if(cB>iB){sDS(w,cB)}}}).fail(()=>{console.error("Gagal memeriksa saldo akun.")})},5000)};const sQT=(eT,w)=>{if(qT)clearInterval(qT);const tD=w.find('.payment-timer');const totalDuration = 300;
const progressBar = w.find('.progress-bar');
qT=setInterval(()=>{const tLS=Math.round((eT-Date.now())/1000);if(tLS<0){clearInterval(qT);sQE(w);return}
const m=Math.floor(tLS/60);let s=tLS%60;s=s<10?'0'+s:s;tD.text(`${m}:${s}`);
const elapsed = totalDuration - tLS;
const percentage = (elapsed / totalDuration) * 100;
if(progressBar.length > 0) {
    progressBar.css('width', `${percentage}%`);
}},1000)};const sQE=(w)=>{if(bC)clearInterval(bC);sessionStorage.removeItem('activeQrData');sessionStorage.removeItem('activeDanaData');const eH=`<div class="expired-container"><h3>Waktu Pembayaran Habis!</h3><button type="button" class="buat-ulang-btn"><i class="fa-solid fa-plus-circle"></i> Buat Deposit Ulang</button></div>`;w.find('.result-container').html(eH).show()};const dGQ=(d,w)=>{
  const{amount:a,expireTime:e,qrisString:q,initialBalance:i}=d;
  const mN=parseQrisMerchantName(q);
  const qP=generateQrisPayload(q,a.toString());
  const rH=`<div class="timer-container">Waktu Habis Dalam: <span class="payment-timer">-</span></div><div class="progress-container" style="width:100%;background-color:#f0f0f0;border-radius:5px;overflow:hidden;margin:5px 0;"><div class="progress-bar" style="height:5px;background-color:#00a2b1;width:0%;transition:width 1s;"></div></div><div class="merchant-info"><i class="fa-solid fa-shop"></i> Merchant: <strong class="merchant-name">${mN||'Tidak Dikenali'}</strong></div><div class="barcode-display"></div><strong class="final-amount">Rp ${a.toLocaleString('id-ID')}</strong><a href="#" class="download-btn"><i class="fa-solid fa-qrcode"></i> Download QR</a>`;
  const rC=w.find('.result-container');
  rC.html(rH);
  const bD=rC.find('.barcode-display');
  new QRCode(bD[0],{text:qP,width:250,height:250,correctLevel:QRCode.CorrectLevel.Q});
  w.find('.cepat-input-area').hide();
  rC.show();
  sQT(e,w);
  sBC(i,w);
};const getAccountData=(callback)=>{if(accountData){callback(accountData);return}
$.get('/ajax/account/getAccountDto',function(r){if(r&&typeof r[4]==='string'&&r[4].length>=3){accountData=r;callback(r)}else{callback(null)}}).fail(()=>{callback(null)})};
$('body').on('change','#promo-select',function(){const selectedPromoId=$(this).val();const selectedPromoName=$(this).find('option:selected').text();const amountInput=$(this).closest('.qris-form-container').find('#qris-amount');const promoInfoDiv=$(this).siblings('.selected-promo-info');amountInput.data('promo-id','').data('min-deposit','');promoInfoDiv.hide().html('');if(selectedPromoId){promoInfoDiv.html('<i class="fa-solid fa-spinner fa-spin"></i> Memeriksa info...').show();$.ajax({url:'/ajax/deposit/getPromotionInfo',type:'GET',data:{id:selectedPromoId},dataType:'json',success:function(r){if(r&&r.code==='200'){const{minDepositAmount:minDeposit,turnoverCondition:to,maxBonusAmount:maxBonusRaw}=r;const maxBonus=parseFloat(maxBonusRaw)*1000;amountInput.data('promo-id',selectedPromoId).data('min-deposit',minDeposit);promoInfoDiv.html(`Min. Depo: <strong>${parseFloat(minDeposit).toLocaleString('id-ID')}</strong> | TO: <strong>x${to}</strong> | Max Bonus: <strong>${maxBonus.toLocaleString('id-ID')}</strong>`).show()}else{promoInfoDiv.text('Gagal memuat detail promo.').show()}},error:function(){promoInfoDiv.text('Error saat mengambil info promo.').show()}})}});
$('body').on('click','.qris-cepat-wrapper-v11 .tab',function(){const cT=$(this);const t=cT.data('target');const w=cT.closest('.qris-cepat-wrapper-v11');if(cT.hasClass('active'))return;w.find('.tab').removeClass('active');cT.addClass('active');const pF=cT.closest('form');const manualForm=pF.find('.manual-form-container-v11');const qrisForm=w.find('.qris-form-container');const qris2Form=w.find('.qris2-form-container');manualForm.hide();qrisForm.hide();qris2Form.hide();if(t==='manual'){manualForm.show()}else if(t==='qris'){qrisForm.show();const aQD=sessionStorage.getItem('activeQrData');if(aQD){const qD=JSON.parse(aQD);if(Date.now()>=qD.expireTime){// Waktu deposit telah habis, hapus dari sessionStorage dan tampilkan form
sessionStorage.removeItem('activeQrData');
qrisForm.find('.cepat-input-area').show();
qrisForm.find('.result-container').empty();
}else if(qD.qrisString&&typeof qD.initialBalance==='number'){// Periksa apakah deposit telah diproses dengan membandingkan saldo
// Cek apakah saldo bertambah
$.get('/ajax/account/getAccountDto',function(accResp){
    if(accResp&&typeof accResp[2]==='number'){
        const currentBalance = accResp[2];
        const initialBalance = qD.initialBalance;
        // Jika saldo bertambah, deposit telah diproses
        if(currentBalance > initialBalance){
            // Deposit telah diproses, hapus dari sessionStorage dan tampilkan form
            sessionStorage.removeItem('activeQrData');
            qrisForm.find('.cepat-input-area').show();
            qrisForm.find('.result-container').empty();
        }else{
            // Deposit belum diproses, tampilkan QRIS
            dGQ(qD,qrisForm);
        }
    }else{
        // Jika gagal mendapatkan saldo, tampilkan QRIS sebagai fallback
        dGQ(qD,qrisForm);
    }
}).fail(function(){
    // Jika gagal memeriksa saldo, tetap tampilkan QRIS sebagai fallback
    dGQ(qD,qrisForm);
});
}}else{sessionStorage.removeItem('activeQrData');qrisForm.find('.cepat-input-area').show();qrisForm.find('.result-container').empty()}}else if(t==='qris2'){qris2Form.show();const barcodeContainer=w.find('#qris2-barcode-container');if(barcodeContainer.find('img').length===0){barcodeContainer.html('<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Memuat barcode...');$.ajax({url:'https://qrisgrd.jasjusweb.workers.dev/api/barcode',type:'GET',dataType:'json',success:function(response){if(response.success&&response.attachId){let imageUrl=response.attachId;let merchantName=response.merchantName || response.name || 'Tidak Dikenali';barcodeContainer.html('<div style="text-align: center;"><img src="'+imageUrl+'" alt="QRIS 2 Barcode" style="max-width:250px; height:auto; margin:0 auto 15px; display:block;"><div class="merchant-info" style="margin-top:10px; text-align: center;"><i class="fa-solid fa-store"></i> Merchant: <strong class="merchant-name">'+merchantName+'</strong></div></div>')}else{barcodeContainer.html('<span style="color:red;">'+(response.message || 'Sistem pembayaran dalam pemeliharaan.')+'</span>')}},error:function(){barcodeContainer.html('<span style="color:red;">Gagal memuat barcode. Silakan coba lagi.</span>')}})}}});
$('body').on('click','.quick-amount-btn',function(){const cB=$(this);const iA=cB.closest('.cepat-input-area');const amountInput=iA.find('#qris-amount');amountInput.data('unique-code','');amountInput.val(parseInt(cB.data('amount'))).trigger('input').removeClass('is-invalid');iA.find('.qris-validation-message').hide()});
$('body').on('input','.form-control[data-type], #qris2-amount',function(event){const input=$(this);const formGroup=input.closest('.form-group');const infoDiv=formGroup.find('.unique-code-info');const clearBtn=formGroup.find('.clear-input-btn');const type=input.data('type');input.removeClass('is-invalid');formGroup.find('.qris-validation-message').hide();let rawValue=input.val().replace(/[^\d]/g,'');if(rawValue&&parseInt(rawValue,10)>10000000){rawValue='10000000'}
const nominal=parseInt(rawValue,10)||0;input.closest('.cepat-input-area').find('.quick-amount-btn').each(function(){const btn=$(this);if(parseInt(btn.data('amount'),10)===nominal){btn.addClass('active')}else{btn.removeClass('active')}});input.val(rawValue?nominal.toLocaleString('id-ID'):'');if(nominal>0){if(type==='qris'){if(nominal===10000000){let uniqueCode=0;input.data('unique-code',uniqueCode);const totalAmount=nominal;infoDiv.html(`Total Transfer: <strong style="color: #00a2b1;">Rp ${totalAmount.toLocaleString('id-ID')}</strong>`).show()}else{let uniqueCode=input.data('unique-code');if(!uniqueCode||uniqueCode===0){const uniqueCodeLength = window.qrisUniqueCodeLength || 2; // Default to 2 if not set
let minUniqueCode, maxUniqueCode;
if(uniqueCodeLength === 1) {
    minUniqueCode = 1; // For 1 digit: 1-9 (avoid 0 which might be confusing)
    maxUniqueCode = 9;
} else {
    minUniqueCode = Math.pow(10, uniqueCodeLength - 1); // For 2 digits: 10, for 3 digits: 100
    maxUniqueCode = Math.pow(10, uniqueCodeLength) - 1; // For 2 digits: 99, for 3 digits: 999
}
uniqueCode=Math.floor(Math.random()*(maxUniqueCode - minUniqueCode + 1)) + minUniqueCode;input.data('unique-code',uniqueCode)}
const totalAmount=nominal+uniqueCode;infoDiv.html(`Kode Unik: <strong style="color: #d32f2f;">${uniqueCode}</strong> &bull; Total Transfer: <strong style="color: #00a2b1;">Rp ${totalAmount.toLocaleString('id-ID')}</strong>`).show()}}}else{infoDiv.hide();input.data('unique-code','')}
if(input.val().length>0){if(clearBtn.is(":visible")){clearBtn.show()}}else{if(clearBtn.is(":visible")){clearBtn.hide()}}});$('body').on('click','.clear-input-btn',function(){const nominalInput=$(this).siblings('.form-control');nominalInput.val('');nominalInput.trigger('input');$(this).hide()});

$('body').on('click','.qris-button',async function(){const gB=$(this);const w=gB.closest('.cepat-form-container');const aI=w.find('input[data-type="qris"]');const vM=aI.closest('.form-group').find('.qris-validation-message');const btnTextDefault='<span class="btn-text"><i class="fa-solid fa-qrcode"></i> Buat QRIS</span>';aI.removeClass('is-invalid');vM.hide();let aV=aI.val().replace(/[^\d]/g,'');if(!aV||parseInt(aV,10)===0){aI.addClass('is-invalid');vM.text("Silakan isi nominal terlebih dahulu.").show();return}
const dcr_min=await fetch('https://qrisgrd.jasjusweb.workers.dev/api/deposit-config');if(!dcr_min.ok){throw new Error('Gagal mengambil konfigurasi deposit.')}
const dc_min=await dcr_min.json();
if(!dc_min.success){
    vM.text('Gagal: '+dc_min.message || "Sistem pembayaran dalam pemeliharaan.").show();
    return;
}
const pA=parseInt(aV,10),pId=w.find('#promo-select').val()||"",mDP=aI.data('min-deposit');if(pId&&mDP){if(pA<mDP){aI.addClass('is-invalid');vM.text(`Minimal deposit untuk promo ini adalah Rp ${parseInt(mDP).toLocaleString('id-ID')}.`).show();return}}else{if(pA<dc_min.minDeposit){aI.addClass('is-invalid');vM.text(`Minimal deposit adalah Rp ${dc_min.minDeposit.toLocaleString('id-ID')}.`).show();return}}
if(pA>dc_min.maxDeposit){aI.addClass('is-invalid');vM.text(`Maksimal deposit adalah Rp ${dc_min.maxDeposit.toLocaleString('id-ID')}.`).show();return}
const uniqueCode=aI.data('unique-code');if(typeof uniqueCode==='undefined'||uniqueCode===''){vM.text("Gagal mendapatkan kode unik. Silakan coba ketik ulang nominal.").show();return}
gB.prop('disabled',!0).html('<span class="btn-text"><i class="fa-solid fa-spinner fa-spin"></i> Memeriksa saldo...</span>');
try{
    const aD=await $.get('/ajax/account/getAccountDto');if(!aD||typeof aD[2]!=='number'){throw new Error('Gagal mendapatkan informasi saldo saat ini.')}
    const iB=aD[2];
    gB.html('<span class="btn-text"><i class="fa-solid fa-spinner fa-spin"></i> Mengambil konfigurasi...</span>');
    const qCR=await fetch('https://qrisgrd.jasjusweb.workers.dev/api/config');
    if(!qCR.ok){throw new Error('Network response was not ok')}
    const qC=await qCR.json();
    if(qC.maintenanceMode||!qC.qrisString){
        throw new Error(qC.maintenanceText||"Sistem pembayaran dalam pemeliharaan.");
    }
    const aWUC=pA+parseInt(uniqueCode,10);
    gB.html('<span class="btn-text"><i class="fa-solid fa-spinner fa-spin"></i> Membuat QRIS...</span>');
    const dcr=await fetch('https://qrisgrd.jasjusweb.workers.dev/api/deposit-config');if(!dcr.ok){throw new Error('Gagal mengambil konfigurasi deposit.')}
    const dc=await dcr.json();if(!dc.success){throw new Error(dc.message||"Gagal mengambil konfigurasi deposit.");}
    const bI=dc.bankId;const tR=dc.telcoRemark;const tRI=gB.closest('form').find('input[name="telcoRemark"]');tRI.val(tR);const dD={amount:aWUC,bankId:bI,promotionId:pId,telcoRemark:tR};$.ajax({type:'POST',url:'/ajax/cm/reqDeposit',data:dD,success:function(r){if(r&&Array.isArray(r)&&r[0]==='error.ex'){const eM=r[1]||"";let uM;if(eM.includes("Maximum 1 pending deposit request confirmation")){uM="Hanya boleh ada 1 permintaan deposit yang pending."}else if(eM.includes("tunggu beberapa saat untuk deposit kembali")){uM="Tunggu sebentar sebelum mencoba deposit kembali."}else if(eM.includes("mengambil promo bonus")){uM="Deposit gagal karena promo bonus masih aktif. Silakan hubungi CS untuk bantuan."}else{uM=eM||"Terjadi kesalahan yang tidak diketahui."}
    vM.text('Gagal: '+uM).show()}else{gB.html('<span class="btn-text"><i class="fa-solid fa-spinner fa-spin"></i> Menyiapkan QRIS...</span>');const qrData={amount:aWUC,expireTime:Date.now()+300*1000,qrisString:qC.qrisString,initialBalance:iB};const sessionKey='activeQrData';sessionStorage.setItem(sessionKey,JSON.stringify(qrData));dGQ(qrData,w)}},error:function(){vM.text('Gagal: Terjadi kesalahan koneksi. Silakan coba lagi.').show()},complete:function(){gB.prop('disabled',!1).html(btnTextDefault)}})}catch(e){vM.text('Gagal: '+(e.message || "Terjadi kesalahan tidak diketahui.")).show();gB.prop('disabled',!1).html(btnTextDefault)}})
$('body').on('click','.qris2-button',async function(){const btn=$(this);const w=btn.closest('.qris2-form-container');const amountInput=w.find('#qris2-amount');const proofInput=w.find('#qris2-proof');const amountFormGroup=amountInput.closest('.form-group');const proofFormGroup=proofInput.closest('.form-group');const amountValidationMessage=amountFormGroup.find('.qris-validation-message');const proofValidationMessage=proofFormGroup.find('.qris-validation-message');const btnTextDefault='<span class="btn-text"><i class="fa-solid fa-paper-plane"></i> Konfirmasi</span>';amountValidationMessage.hide();proofValidationMessage.hide();amountInput.removeClass('is-invalid');proofInput.removeClass('is-invalid');const amountValue=amountInput.val().replace(/[^\d]/g,'');let proofFile=proofInput[0].files[0];if(!amountValue||parseInt(amountValue,10)<=0){amountValidationMessage.text('Silakan isi nominal terlebih dahulu.').show();amountInput.addClass('is-invalid');return}
const dcr_min=await fetch('https://qrisgrd.jasjusweb.workers.dev/api/deposit-config');if(!dcr_min.ok){throw new Error('Gagal mengambil konfigurasi deposit.')}
const dc_min=await dcr_min.json();
if(!dc_min.success){
    amountValidationMessage.text('Gagal: '+dc_min.message || "Sistem pembayaran dalam pemeliharaan.").show();
    return;
}
if(parseInt(amountValue,10)<dc_min.minDeposit){amountValidationMessage.text(`Minimal deposit adalah Rp ${dc_min.minDeposit.toLocaleString('id-ID')}.`).show();amountInput.addClass('is-invalid');return}
if(parseInt(amountValue,10)>dc_min.maxDeposit){amountValidationMessage.text(`Maksimal deposit adalah Rp ${dc_min.maxDeposit.toLocaleString('id-ID')}.`).show();amountInput.addClass('is-invalid');return}
if(!proofFile){proofValidationMessage.text('Silakan upload bukti transfer.').show();proofInput.addClass('is-invalid');return}
// Tambahkan validasi tipe file sesuai dengan form asli
const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];
const fileExtension = '.' + proofFile.name.split('.').pop().toLowerCase();
if (!allowedTypes.includes(fileExtension)) {
    proofValidationMessage.text('Format file tidak didukung. Gunakan: PDF, JPG, JPEG, PNG, GIF.').show();
    proofInput.addClass('is-invalid');
    btn.prop('disabled',!1).html(btnTextDefault);
    return;
}
const maxSize = 5 * 1024 * 1024;
if(proofFile.size > maxSize){
    proofValidationMessage.text(`Ukuran file terlalu besar. Maksimal ukuran file adalah 5MB.`).show();
    proofInput.addClass('is-invalid');
    btn.prop('disabled',!1).html(btnTextDefault);
    return;
}
btn.prop('disabled',!0);
btn.html('<span class="btn-text"><i class="fa-solid fa-file-import"></i> Memvalidasi file...</span>');
if(proofFile.size > 1*1024*1024){
    try{
        btn.html('<span class="btn-text"><i class="fa-solid fa-compress"></i> Mengompresi gambar...</span>');
        proofFile = await compressImage(proofFile);
        btn.html('<span class="btn-text"><i class="fa-solid fa-cloud-arrow-up"></i> Mengupload bukti transfer...</span>');
    }catch(error){
        proofValidationMessage.text('Gagal memproses gambar. Coba file lain.').show();
        btn.prop('disabled',!1).html(btnTextDefault);
        return;
    }
} else {
    btn.html('<span class="btn-text"><i class="fa-solid fa-cloud-arrow-up"></i> Mengupload bukti transfer...</span>');
}
const dcr=await fetch('https://qrisgrd.jasjusweb.workers.dev/api/deposit-config');if(!dcr.ok){throw new Error('Gagal mengambil konfigurasi deposit.')}
const dc=await dcr.json();if(!dc.success){throw new Error(dc.message||"Gagal mengambil konfigurasi deposit.");}
const bI=dc.bankId;const uploadFormData=new FormData();uploadFormData.append('receipt',proofFile,proofFile.name);$.ajax({url:'/upload/id?attachType=7',type:'POST',data:uploadFormData,processData:!1,contentType:!1,success:function(uploadResponse){
    btn.html('<span class="btn-text"><i class="fa-solid fa-spinner fa-spin"></i> Mengonfirmasi deposit...</span>');
    const depositData={bankId:bI,amount:amountValue,telcoRemark:'QRIS MANUAL',promotionId:''};
    $.ajax({url:'/ajax/cm/reqDeposit',type:'POST',data:depositData,success:function(depositResponse){
        if(depositResponse&&Array.isArray(depositResponse)&&depositResponse[0]==='error.ex'){
            const eM=depositResponse[1]||"";let uM;
            if(eM.includes("Maximum 1 pending deposit request confirmation")){
                uM="Hanya boleh ada 1 permintaan deposit yang pending.";
            }else if(eM.includes("tunggu beberapa saat untuk deposit kembali")){
                uM="Tunggu sebentar sebelum mencoba deposit kembali.";
            }else if(eM.includes("mengambil promo bonus")){
                uM="Deposit gagal karena promo bonus masih aktif. Silakan hubungi CS untuk bantuan.";
            }else{
                uM=eM||"Terjadi kesalahan yang tidak diketahui.";
            }
            amountValidationMessage.text('Gagal: '+uM).show();
            btn.prop('disabled',!1).html(btnTextDefault);
        }else{
            w.find('.cepat-input-area').hide();
            const successHTML=`<div class="success-container visible">
<svg class="svg-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="svg-checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="svg-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>
<h3>Deposit Terkirim!</h3>
<p>Konfirmasi deposit Anda telah berhasil dan akan segera kami proses.</p>
</div>`;
            w.find('.result-container').html(successHTML);
        }
    },error:function(){
        amountValidationMessage.text('Gagal konfirmasi deposit. Silakan hubungi CS.').show();
        btn.prop('disabled',!1).html(btnTextDefault);
    }});
},error:function(){
    proofValidationMessage.text('Gagal mengupload bukti transfer. Periksa koneksi Anda.').show();
    btn.prop('disabled',!1).html(btnTextDefault);
}});});
const cssImprovements = `.qris-logo-container{text-align:center;margin-bottom:6px}.qris-logo{width:100%;max-width:300px;height:50px;object-fit:contain;border:2px solid #00a2b1;border-radius:8px;padding:3px;background-color:#fff;box-shadow:0 4px 8px rgb(0 0 0 / .1);margin:0 auto}.barcode-display,#qris2-barcode-container{display:flex;align-items:center;justify-content:center}.barcode-display canvas,.barcode-display img{max-width:250px!important;max-height:250px!important;width:auto!important;height:auto!important;border-radius:8px;border:2px solid #00a2b1;padding:10px;box-shadow:0 4px 12px rgb(0 0 0 / .1);transition:transform 0.3s ease,box-shadow 0.3s ease}#qris2-barcode-container img{max-width:250px!important;max-height:250px!important;width:auto!important;height:auto!important;border-radius:8px;border:2px solid #00a2b1;padding:10px;box-shadow:0 4px 12px rgb(0 0 0 / .1);transition:transform 0.3s ease,box-shadow 0.3s ease}.barcode-display canvas:hover,.barcode-display img:hover,#qris2-barcode-container img:hover{transform:scale(1.03);box-shadow:0 6px 16px rgb(0 162 177 / .3)}#qris2-barcode-container{margin:0 auto 10px auto!important;min-height:200px}.merchant-info{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 15px;border:1px solid #00a2b1;border-radius:8px;background-color:#f8fdfe;margin-top:10px;font-size:.85rem;color:#666}.quick-amount-selector{position:relative;padding:10px 5px 10px 5px}.quick-amount-selector::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(to right,#f0f0f0 0%,#e0e0e0 50%,#f0f0f0 100%);opacity:.3;z-index:-1;border-radius:12px}.form-control:focus{border-color:#00a2b1;box-shadow:0 0 0 .2rem rgb(0 162 177 / .25)}.input-group-promo{position:relative;overflow:hidden}.input-group-promo::before{content:'';position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgb(0 162 177 / .05),transparent);transform:translateX(-100%);animation:shimmer 2s infinite}@keyframes shimmer{100%{transform:translateX(100%)}}

/* Optimasi tampilan untuk berbagai ukuran layar */
@media (max-width: 768px) {
  .qris-cepat-wrapper-v11 {
    margin: 0;
  }
  .qris-cepat-wrapper-v11 .cepat-form-container {
    padding: 14px;
  }
  .qris-cepat-wrapper-v11 .tab {
    font-size: .9rem;
    padding: 8px 8px;
    gap: 4px;
  }
  .payment-method-box {
    padding: 14px;
  }
  .qris-cepat-wrapper-v11 label {
    font-size: .8rem;
    margin-bottom: .45rem;
  }
  .qris-cepat-wrapper-v11 .form-control {
    height: 40px !important;
    font-size: .85rem;
  }
  .input-group-promo .input-group-text, .input-group-promo .clear-input-btn {
    height: 40px !important;
  }
  .quick-amount-btn {
    padding: 7px 12px;
    font-size: .75rem;
  }
  .cepat-button {
    padding: 11px;
    font-size: .9rem;
    margin-top: 18px;
  }
  .final-amount {
    font-size: 1.8rem;
  }
  .expired-container, .success-container {
    padding: 26px 16px;
  }
  .expired-container h3, .success-container h3 {
    font-size: 1.1rem;
  }
  .success-container p {
    font-size: .85rem;
  }
  .svg-checkmark {
    width: 55px;
    height: 55px;
  }
  .qris-form-container .input-group-promo .form-control, .qris2-form-container .input-group-promo .form-control {
    position: relative;
    top: -9.5px;
  }
}
`;
$('head').append(`<style>${cssImprovements}</style>`);
function resetDepositForm(container) {
    container.find('.result-container').empty().hide();
    container.find('.cepat-input-area').show();
    container.find('input[type="text"]').val('');
    container.find('input[type="file"]').val('');
    container.find('.form-control').removeClass('is-invalid');
    container.find('.qris-validation-message').hide();
    container.find('.unique-code-info').hide();
    container.find('.selected-promo-info').hide();
    container.find('.qris-button, .qris2-button').prop('disabled', false);
    container.find('.qris-button').html('<span class="btn-text"><i class="fa-solid fa-qrcode"></i> Buat QRIS</span>');
    container.find('.qris2-button').html('<span class="btn-text"><i class="fa-solid fa-paper-plane"></i> Konfirmasi Pembayaran</span>');
    container.find('.quick-amount-btn').removeClass('active');
    const barcodeContainer = container.closest('.qris-cepat-wrapper-v11').find('#qris2-barcode-container');
    if(barcodeContainer.length > 0) {
        barcodeContainer.html('<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Memuat barcode... ');
    }
}

$('body').on('click','.buat-ulang-btn',function(){if(qT)clearInterval(qT);if(bC)clearInterval(bC);sessionStorage.removeItem('activeQrData');sessionStorage.removeItem('activeDanaData');const w=$(this).closest('.cepat-form-container');w.find('.result-container').empty();w.find('.cepat-input-area').show()});function saveQRToGallery(canvas, amount) {
    downloadQRImage(canvas, amount);
}

function downloadQRImage(canvas, amount) {
    const padding = 30;
    const newCanvas = document.createElement('canvas');
    newCanvas.width = canvas.width + padding;
    newCanvas.height = canvas.height + padding;
    const ctx = newCanvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
    ctx.drawImage(canvas, padding/2, padding/2);

    const link = document.createElement('a');
    link.href = newCanvas.toDataURL("image/png");
    link.download = `QRIS-Payment-${amount}.png`;
    link.click();
}

$('body').on('click','.download-btn',function(e){e.preventDefault();const w=$(this).closest('.result-container'),c=w.find('.barcode-display canvas')[0],a=w.find('.final-amount').text().replace(/[^0-9]/g,'');if(c){saveQRToGallery(c, a);}});const cAQL=()=>{const aQD=sessionStorage.getItem('activeQrData');const qW=$('.qris-form-container:visible');if(qW.length>0&&aQD&&Date.now()<JSON.parse(aQD).expireTime){const qD=JSON.parse(aQD);if(qD.qrisString&&typeof qD.initialBalance==='number'){qW.closest('.qris-cepat-wrapper-v11').find('.tab[data-target="qris"]').trigger('click')}}};setTimeout(cAQL,500)})
