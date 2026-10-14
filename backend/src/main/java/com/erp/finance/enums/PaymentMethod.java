package com.erp.finance.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum PaymentMethod { 
    CASH, BANK_TRANSFER, CARD, UPI, ONLINE, OTHER;

    @JsonCreator
    public static PaymentMethod fromString(String value) {
        if (value == null) return null;
        String normalized = value.trim().toUpperCase();
        if ("NET_BANKING".equals(normalized) || "NETBANKING".equals(normalized)) {
            return BANK_TRANSFER;
        }
        return PaymentMethod.valueOf(normalized);
    }
}
