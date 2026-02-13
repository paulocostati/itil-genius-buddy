/**
 * Gera payload PIX estático no padrão EMV/BRCode
 * Referência: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf
 */

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

interface PixPayloadOptions {
  /** Chave PIX (email, CNPJ, telefone ou chave aleatória) */
  pixKey: string;
  /** Nome do recebedor (até 25 chars) */
  merchantName: string;
  /** Cidade do recebedor (até 15 chars) */
  merchantCity: string;
  /** Valor em reais (ex: 49.90). Se omitido, valor livre. */
  amount?: number;
  /** Identificador da transação (até 25 chars) */
  txId?: string;
}

export function generatePixPayload(options: PixPayloadOptions): string {
  const {
    pixKey,
    merchantName,
    merchantCity,
    amount,
    txId = '***',
  } = options;

  // Merchant Account Information (ID 26)
  const gui = tlv('00', 'BR.GOV.BCB.PIX');
  const key = tlv('01', pixKey);
  const merchantAccountInfo = tlv('26', gui + key);

  let payload = '';
  payload += tlv('00', '01'); // Payload Format Indicator
  payload += merchantAccountInfo;
  payload += tlv('52', '0000'); // Merchant Category Code
  payload += tlv('53', '986'); // Transaction Currency (BRL)

  if (amount && amount > 0) {
    payload += tlv('54', amount.toFixed(2));
  }

  payload += tlv('58', 'BR'); // Country Code
  payload += tlv('59', merchantName.substring(0, 25)); // Merchant Name
  payload += tlv('60', merchantCity.substring(0, 15)); // Merchant City
  payload += tlv('62', tlv('05', txId.substring(0, 25))); // Additional Data - TxID

  // CRC16 (ID 63, length 04)
  payload += '6304';
  const checksum = crc16(payload);
  payload += checksum;

  return payload;
}
