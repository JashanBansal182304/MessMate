package com.example.MessMate.repository;

import com.example.MessMate.entity.MenuItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class MenuItemRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private MenuItemRepository menuItemRepository;

    private MenuItem breakfastItem;
    private MenuItem lunchItem;
    private MenuItem vegItem;
    private MenuItem nonVegItem;

    @BeforeEach
    void setUp() {
        // Create test menu items
        breakfastItem = new MenuItem();
        breakfastItem.setName("Breakfast Special");
        breakfastItem.setDescription("Delicious breakfast");
        breakfastItem.setPrice(new BigDecimal("50.00"));
        breakfastItem.setMealType(MenuItem.MealType.BREAKFAST);
        breakfastItem.setCategory(MenuItem.FoodCategory.MAIN_COURSE);
        breakfastItem.setIsVegetarian(true);
        breakfastItem.setIsAvailable(true);
        entityManager.persistAndFlush(breakfastItem);

        lunchItem = new MenuItem();
        lunchItem.setName("Lunch Combo");
        lunchItem.setDescription("Complete lunch meal");
        lunchItem.setPrice(new BigDecimal("80.00"));
        lunchItem.setMealType(MenuItem.MealType.LUNCH);
        lunchItem.setCategory(MenuItem.FoodCategory.MAIN_COURSE);
        lunchItem.setIsVegetarian(false);
        lunchItem.setIsAvailable(true);
        entityManager.persistAndFlush(lunchItem);

        vegItem = new MenuItem();
        vegItem.setName("Veg Curry");
        vegItem.setDescription("Spicy vegetarian curry");
        vegItem.setPrice(new BigDecimal("60.00"));
        vegItem.setMealType(MenuItem.MealType.DINNER);
        vegItem.setCategory(MenuItem.FoodCategory.CURRY);
        vegItem.setIsVegetarian(true);
        vegItem.setIsAvailable(true);
        entityManager.persistAndFlush(vegItem);

        nonVegItem = new MenuItem();
        nonVegItem.setName("Chicken Curry");
        nonVegItem.setDescription("Delicious chicken curry");
        nonVegItem.setPrice(new BigDecimal("90.00"));
        nonVegItem.setMealType(MenuItem.MealType.DINNER);
        nonVegItem.setCategory(MenuItem.FoodCategory.CURRY);
        nonVegItem.setIsVegetarian(false);
        nonVegItem.setIsAvailable(false); // Not available
        entityManager.persistAndFlush(nonVegItem);
    }

    @Test
    void testFindByMealTypeAndIsAvailableTrue_ShouldReturnAvailableItemsForMealType() {
        // When
        List<MenuItem> breakfastItems = menuItemRepository.findByMealTypeAndIsAvailableTrue(MenuItem.MealType.BREAKFAST);
        List<MenuItem> dinnerItems = menuItemRepository.findByMealTypeAndIsAvailableTrue(MenuItem.MealType.DINNER);

        // Then
        assertThat(breakfastItems).hasSize(1);
        assertThat(breakfastItems.get(0).getName()).isEqualTo("Breakfast Special");

        assertThat(dinnerItems).hasSize(1); // Only veg curry is available
        assertThat(dinnerItems.get(0).getName()).isEqualTo("Veg Curry");
    }

    @Test
    void testFindByCategoryAndIsAvailableTrue_ShouldReturnAvailableItemsByCategory() {
        // When
        List<MenuItem> mainCourseItems = menuItemRepository.findByCategoryAndIsAvailableTrue(MenuItem.FoodCategory.MAIN_COURSE);
        List<MenuItem> curryItems = menuItemRepository.findByCategoryAndIsAvailableTrue(MenuItem.FoodCategory.CURRY);

        // Then
        assertThat(mainCourseItems).hasSize(2);
        assertThat(mainCourseItems).extracting(MenuItem::getName)
                .containsExactlyInAnyOrder("Breakfast Special", "Lunch Combo");

        assertThat(curryItems).hasSize(1); // Only veg curry is available
        assertThat(curryItems.get(0).getName()).isEqualTo("Veg Curry");
    }

    @Test
    void testFindByIsVegetarianAndIsAvailableTrue_ShouldReturnVegetarianItems() {
        // When
        List<MenuItem> vegItems = menuItemRepository.findByIsVegetarianAndIsAvailableTrue(true);
        List<MenuItem> nonVegItems = menuItemRepository.findByIsVegetarianAndIsAvailableTrue(false);

        // Then
        assertThat(vegItems).hasSize(2);
        assertThat(vegItems).extracting(MenuItem::getName)
                .containsExactlyInAnyOrder("Breakfast Special", "Veg Curry");

        assertThat(nonVegItems).hasSize(1); // Only lunch combo is available
        assertThat(nonVegItems.get(0).getName()).isEqualTo("Lunch Combo");
    }

    @Test
    void testFindByNameContainingIgnoreCaseAndIsAvailableTrue_ShouldReturnMatchingItems() {
        // When
        List<MenuItem> curryItems = menuItemRepository.findByNameContainingIgnoreCaseAndIsAvailableTrue("curry");
        List<MenuItem> specialItems = menuItemRepository.findByNameContainingIgnoreCaseAndIsAvailableTrue("SPECIAL");

        // Then
        assertThat(curryItems).hasSize(1); // Only veg curry is available
        assertThat(curryItems.get(0).getName()).isEqualTo("Veg Curry");

        assertThat(specialItems).hasSize(1);
        assertThat(specialItems.get(0).getName()).isEqualTo("Breakfast Special");
    }

    @Test
    void testFindAll_ShouldReturnAllItems() {
        // When
        List<MenuItem> allItems = menuItemRepository.findAll();

        // Then
        assertThat(allItems).hasSize(4);
        assertThat(allItems).extracting(MenuItem::getName)
                .containsExactlyInAnyOrder("Breakfast Special", "Lunch Combo", "Veg Curry", "Chicken Curry");
    }
}
