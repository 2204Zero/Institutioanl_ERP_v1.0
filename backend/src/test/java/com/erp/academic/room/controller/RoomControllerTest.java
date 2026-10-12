package com.erp.academic.room.controller;

import com.erp.academic.room.entity.Room;
import com.erp.academic.room.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RoomRepository roomRepository;

    @BeforeEach
    public void setup() {
        roomRepository.deleteAll();
        Room room = new Room();
        room.setName("Room 101");
        room.setCapacity(60);
        room.setIsActive(true);
        roomRepository.save(room);

        Room inactiveRoom = new Room();
        inactiveRoom.setName("Room 102");
        inactiveRoom.setCapacity(30);
        inactiveRoom.setIsActive(false);
        roomRepository.save(inactiveRoom);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testGetAllRooms_AsAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Room 101"));
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    public void testGetAllRooms_AsStudent() throws Exception {
        mockMvc.perform(get("/api/v1/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Room 101"));
    }

    @Test
    public void testGetAllRooms_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/rooms"))
                .andExpect(status().isUnauthorized());
    }
}
